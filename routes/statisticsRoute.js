const express = require("express");
const StatisticsController = require("../controllers/statisticsController");

const router = express.Router();
const controller = new StatisticsController();

router.route("/payment").get(controller.paymentStatistics);
router.route("/sale").get(controller.saleStatistics);

module.exports = router;
