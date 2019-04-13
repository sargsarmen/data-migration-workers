const successMiddlewar = (req, res, next) => {
  if (typeof res.payload !== "undefined") {
    res.send(res.payload);
  } else {
    next();
  }
};

module.exports = successMiddlewar;
