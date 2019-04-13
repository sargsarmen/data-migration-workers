const jobService = require("../services/jobService");
const AppController = require("./appController");

class JobsController extends AppController {
  startPayments = async (req, res, next) => {
    try {
      jobService.startPaymentsProcessing();

      res.payload = { success: true };
      next();
    } catch (error) {
      this._loggError(error);
      next(new Error(error));
    }
  };

  startSeles = async (req, res, next) => {
    try {
      jobService.startSalesProcessing();

      res.payload = { success: true };
      next();
    } catch (error) {
      this._loggError(error);
      next(new Error(error));
    }
  };
}

module.exports = JobsController;
