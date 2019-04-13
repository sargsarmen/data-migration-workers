/* eslint-disable no-await-in-loop */
const db = require("../db");
const logger = require("../utils/logger");

const updateStatus = async (id, count, status, error = null) => {
  await db.query(
    `UPDATE temporary.temp_sale
                  SET migration_status= $2,
                      migration_count = $3,
                      migration_error = $4
                  WHERE id = $1; `,
    [id, status, count, error]
  );
};

const update = async data => {
  await db.query(
    `UPDATE public.smart_sale
            SET db_id = $1, 
            uid = $2, 
            type = $3, 
            company_id = $4, 
            reference_id = $5, 
            payed = $6, 
            category_uid = $7, 
            product_uid = $8, 
            inventory_uid = $9, 
            ticket_id = $10, 
            strain = $11, 
            weight = $12, 
            date_time = $13, 
            created_at = $14, 
            updated_at = $15, 
            price_post_everything = $16, 
            tax_collected = $17, 
            price_adjusted_for_ticket_discounts = $18, 
            tax_excise = $19, 
            tax_breakdown_hist = $20, 
            tax_collected_excise = $21, 
            is_medical = $22
      WHERE db_id = $1 AND company_id = $4 AND uid = $2;`,
    [
      data.db_id,
      data.uid,
      data.type,
      data.company_id,
      data.reference_id,
      data.payed,
      data.category_uid,
      data.product_uid,
      data.inventory_uid,
      data.ticket_id,
      data.strain,
      data.weight,
      data.date_time,
      data.created_at,
      data.updated_at,
      data.price_post_everything,
      data.tax_collected,
      data.price_adjusted_for_ticket_discounts,
      data.tax_excise,
      data.tax_breakdown_hist,
      data.tax_collected_excise,
      data.is_medical
    ]
  );
};

const insert = async data => {
  await db.query(
    `INSERT into public.smart_sale 
        (db_id, uid, type, company_id, reference_id, payed, category_uid, product_uid, inventory_uid, ticket_id, strain, weight, date_time, created_at, updated_at, price_post_everything, tax_collected, price_adjusted_for_ticket_discounts, tax_excise, tax_breakdown_hist, tax_collected_excise, is_medical)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
    [
      data.db_id,
      data.uid,
      data.type,
      data.company_id,
      data.reference_id,
      data.payed,
      data.category_uid,
      data.product_uid,
      data.inventory_uid,
      data.ticket_id,
      data.strain,
      data.weight,
      data.date_time,
      data.created_at,
      data.updated_at,
      data.price_post_everything,
      data.tax_collected,
      data.price_adjusted_for_ticket_discounts,
      data.tax_excise,
      data.tax_breakdown_hist,
      data.tax_collected_excise,
      data.is_medical
    ]
  );
};

const processData = async data => {
  const tryCount = 2;
  for (let i = 1; i <= tryCount; i++) {
    try {
      await insert(data);

      await updateStatus(data.id, i, "inserted");

      return;
    } catch (error) {
      if (i === tryCount) {
        try {
          await update(data);

          await updateStatus(data.id, i, "updated");
        } catch (err) {
          await updateStatus(data.id, i, "error", err.message);
        }
      }
    }
  }
};

const selectQueryByPaging = count => {
  const query = `
      UPDATE temporary.temp_sale as s
        SET migration_status = 'inprogress'
      FROM (Select q.* 
        FROM (SELECT * FROM temporary.temp_sale 
                   WHERE migration_status IS NULL 
                   ORDER BY id 
                   LIMIT ${count} ) as q
        FOR UPDATE) AS sales_to_update
      WHERE s.id IN (sales_to_update.id)
      RETURNING sales_to_update.*;
      `;

  return query;
};

const startJob = async count => {
  const query = selectQueryByPaging(count);

  const data = await db.query(query);

  const { length } = data.rows;
  for (let i = 0; i < length; i++) {
    try {
      await processData(data.rows[i]);
    } catch (error) {
      logger.info(
        `Sale worker ${process.pid} error - ${error.message} dataId - ${
          data.rows[id]
        }`
      );
    }
  }
};

process.on("message", async count => {
  try {
    logger.info(`Sale worker ${process.pid} started data migration`);

    await startJob(count);

    logger.info(`Sale worker ${process.pid} finished data migration`);

    process.send({ success: true });
  } catch (err) {
    logger.info(`Sale worker ${process.pid} error - ${error.message}`);

    process.send({ success: false, error: err.message });
  }
});
