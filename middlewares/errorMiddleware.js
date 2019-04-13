const errorMiddlewar = (err, req, res) => {
  if (req.app.get("env") === "production") {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  } else {
    const debug = {
      status: err.status,
      trace: err.stack
    };
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: debug
    });
  }
};

module.exports = errorMiddlewar;
