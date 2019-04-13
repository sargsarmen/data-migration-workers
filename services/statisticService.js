const db = require("../db/");

const paymentStatistics = async () => {
  const query = `Select (Select Count(*) from temporary.temp_payment Where migration_status = 'inserted') as "InsertedPaymentsCount",
  (Select Count(*) from temporary.temp_payment Where migration_status = 'updated') as "UpdatedPaymentsCount",
  (Select Count(*) from temporary.temp_payment Where migration_status = 'error') as "ErrorsPaymentsCount"`;

  const results = await db.query(query);
  const [data] = results.rows;

  return data;
};

const saleStatistics = async () => {
  const query = `Select (Select Count(*) from temporary.temp_sale Where migration_status = 'inserted') as "InsertedSalesCount",
  (Select Count(*) from temporary.temp_sale Where migration_status = 'updated') as "UpdatedSalesCount",
  (Select Count(*) from temporary.temp_sale Where migration_status = 'error') as "ErrorsSalesCount"`;

  const results = await db.query(query);
  const [data] = results.rows;
  return data;
};

module.exports = {
  paymentStatistics,
  saleStatistics
};
