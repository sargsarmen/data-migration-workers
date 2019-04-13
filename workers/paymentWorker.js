/* eslint-disable no-await-in-loop */
const db = require("../db");
const logger = require("../utils/logger");

const updateStatus = async (id, count, status, error = null) => {
  await db.query(
    `UPDATE temporary.temp_payment
                  SET migration_status= $2,
                      migration_count = $3,
                      migration_error = $4
                  WHERE id = $1; `,
    [id, status, count, error]
  );
};

const update = async data => {
  await db.query(
    `UPDATE public.smart_payment
        SET company_id = $1, 
        payment_method = $2, 
        amount = $3, 
        ticket_id = $4, 
        db_id = $5, 
        reference_id = $6, 
        date_time = $7, 
        created_at = $8, 
        updated_at = $9
      WHERE db_id = $5 AND company_id = $1 AND ticket_id = $4;`,
    [
      data.company_id,
      data.payment_method,
      data.amount,
      data.ticket_id,
      data.db_id,
      data.reference_id,
      data.date_time,
      data.created_at,
      data.updated_at
    ]
  );
};

const insert = async data => {
  await db.query(
    `INSERT into public.smart_payment 
    (company_id, payment_method, amount, ticket_id, db_id, reference_id, date_time, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      data.company_id,
      data.payment_method,
      data.amount,
      data.ticket_id,
      data.db_id,
      data.reference_id,
      data.date_time,
      data.created_at,
      data.updated_at
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
      UPDATE temporary.temp_payment as s
        SET migration_status = 'inprogress'
      FROM (Select q.* 
        FROM (SELECT * FROM temporary.temp_payment 
                   WHERE migration_status IS NULL 
                   ORDER BY id 
                   LIMIT ${count} ) as q
        FOR UPDATE) AS payments_to_update
      WHERE s.id IN (payments_to_update.id)
      RETURNING payments_to_update.*;
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
        `Payment worker ${process.pid} error - ${error.message} dataId - ${
          data.rows[id]
        }`
      );
    }
  }
};

process.on("message", async count => {
  try {
    logger.info(`Payment worker ${process.pid} started data migration`);

    await startJob(count);

    logger.info(`Payment worker ${process.pid} finished data migration`);

    process.send({ success: true });
  } catch (err) {
    logger.info(`Payment worker ${process.pid} error - ${error.message}`);

    process.send({ success: false, error: err.message });
  }
});
