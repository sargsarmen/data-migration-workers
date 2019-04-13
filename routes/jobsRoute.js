const express = require("express");
const JobsController = require("../controllers/jobsController");

const router = express.Router();
const controller = new JobsController();

router.route("/startPayments").post(controller.startPayments);
router.route("/startSeles").post(controller.startSeles);

module.exports = router;
