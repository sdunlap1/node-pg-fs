const express = require("express");
const router = express.Router();
const db = require("../db");

// Add a new industry
router.post("/", async function (req, res, next) {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Associate an industry with a company
router.post("/:ind_code/companies/:comp_code", async function (req, res, next) {
  try {
    const { ind_code, comp_code } = req.params;
    const result = await db.query(
      "INSERT INTO company_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code",
      [comp_code, ind_code]
    );
    return res.status(201).json({ association: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
