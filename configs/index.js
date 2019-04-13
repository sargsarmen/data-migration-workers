const configs = {
  postgre: {
    user: process.env.POSTGRE_USER || "postgres",
    host: process.env.POSTGRE_HOST || "localhost",
    dbName: process.env.POSTGRE_DBNAME || "postgres",
    password: process.env.POSTGRE_PASSWORD || "1234",
    port: process.env.POSTGRE_PORT || 5432
  },
  api: {
    version: process.env.API_VERSION || "1"
  },
  port: process.env.PORT || 3000,
  job: {
    saleJobWorkerCount: process.env.SALE_JOB_WORKER_COUNT || 4,
    paymentJobWorkerCount: process.env.PAYMENT_JOB_WORKER_COUNT || 3
  }
};

module.exports = configs;
