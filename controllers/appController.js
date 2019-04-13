const logger = require("../utils/logger");

class AppController {
  _loggInfo = message => {
    logger.info(`Info - ${message}`);
  };

  _loggError = error => {
    logger.error(`Status - ${error.status}
                  Message - ${error.message}
                  Trace - ${error.stack}`);
  };
}

module.exports = AppController;
