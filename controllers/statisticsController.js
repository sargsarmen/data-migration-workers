const statisticService = require("../services/statisticService");
const AppController = require("./appController");

class StatisticsController extends AppController {
  paymentStatistics = async (req, res, next) => {
    try {
      res.payload = await statisticService.paymentStatistics();

      next();
    } catch (error) {
      this._loggError(error);
      next(new Error(error));
    }
  };

  saleStatistics = async (req, res, next) => {
    try {
      res.payload = await statisticService.saleStatistics();

      next();
    } catch (error) {
      this._loggError(error);
      next(new Error(error));
    }
  };
}

module.exports = StatisticsController;
