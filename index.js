const express = require("express");
// eslint-disable-next-line import/no-extraneous-dependencies
const bodyParser = require("body-parser");
const logger = require("morgan");

const app = express();

const notFoundMiddlewar = require("./middlewares/notFoundMiddleware");
const errorMiddlewar = require("./middlewares/errorMiddleware");
const successMiddlewar = require("./middlewares/successMiddleware");
const routes = require("./routes/");
const config = require("./configs/");

app.use(logger(app.get("env") === "production" ? "combined" : "dev"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(`/api/v${config.api.version}`, routes);

app.use(successMiddlewar);
app.use(notFoundMiddlewar);
app.use(errorMiddlewar);

app.listen(config.port, () => {
  console.log(`App running on port ${config.port}.`);
});
