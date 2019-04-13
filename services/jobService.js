const { fork } = require("child_process");
const db = require("../db/");
const config = require("../configs");
const logger = require("../utils/logger");

const initWorker = (count, workerPath) => {
  return new Promise(resolve => {
    const forked = fork(workerPath);

    forked.on("message", msg => {
      forked.kill();
      resolve(msg);
    });

    forked.send(count);
  });
};

const getPagingInfo = (totalCount, pageCount) => {
  const batchCount = parseInt(totalCount / pageCount, 10);
  const paginationInfo = [];

  for (let i = 0; i < pageCount; i++) {
    paginationInfo.push(
      i + 1 === pageCount ? totalCount - batchCount * i : batchCount
    );
  }
  return paginationInfo;
};

const getSalesPagingInfo = async () => {
  const countResult = await db.query(
    "SELECT COUNT(*) FROM temporary.temp_sale WHERE migration_status IS NULL;"
  );
  const { count } = countResult.rows[0];

  return getPagingInfo(count, config.job.saleJobWorkerCount);
};

const getPaymentsPagingInfo = async () => {
  const countResult = await db.query(
    "SELECT COUNT(*) FROM temporary.temp_payment WHERE migration_status IS NULL;"
  );
  const { count } = countResult.rows[0];

  return getPagingInfo(count, config.job.paymentJobWorkerCount);
};

const startSalesProcessing = async () => {
  try {
    logger.info(`Starting Sale workers.`);

    const counts = await getSalesPagingInfo();
    await Promise.all(
      counts.map(count => {
        return initWorker(count, `${__dirname}/../workers/saleWorker.js`);
      })
    );

    logger.info(`Stoped Sale workers.`);
  } catch (error) {
    logger.error(`Sale worker error - ${error.message}`);
  }
};

const startPaymentsProcessing = async () => {
  try {
    logger.info(`Starting Payment workers.`);

    const counts = await getPaymentsPagingInfo();
    await Promise.all(
      counts.map(count => {
        return initWorker(count, `${__dirname}/../workers/paymentWorker.js`);
      })
    );

    logger.info(`Stoped Payment workers.`);
  } catch (error) {
    logger.error(`Payment worker error - ${error.message}`);
  }
};

module.exports = { startSalesProcessing, startPaymentsProcessing };
