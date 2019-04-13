const express = require("express");

const statisticsRoutes = require("./statisticsRoute");
const jobsRoutes = require("./jobsRoute");

const router = express.Router();

router.use("/statistics", statisticsRoutes);
router.use("/jobs", jobsRoutes);

module.exports = router;
