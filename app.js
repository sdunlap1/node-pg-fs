const express = require("express");
const app = express();
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");
const industriesRoutes = require("./routes/industries");  // Make sure this is included

app.use(express.json());

app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);
app.use("/industries", industriesRoutes);  // Mount the industries routes here

// 404 handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  return next(err);
});

// General error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  return res.json({
    error: err.message,
  });
});

module.exports = app;
