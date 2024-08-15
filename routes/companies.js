const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /companies
router.get("/", async function (req, res, next) {
  try {
    const result = await db.query("SELECT code, name FROM companies");
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /companies/[code]
router.get("/:code", async function (req, res, next) {
  try {
    const { code } = req.params;

    // Get the company details
    const compResult = await db.query(
      "SELECT code, name, description FROM companies WHERE code = $1",
      [code]
    );

    if (compResult.rows.length === 0) {
      throw new ExpressError(`Company with code ${code} not found`, 404);
    }

    // Get the company's invoices
    const invResult = await db.query(
      "SELECT id FROM invoices WHERE comp_code = $1",
      [code]
    );

    // Get the company's industries
    const indResult = await db.query(
      `SELECT i.industry
       FROM industries AS i
       JOIN company_industries AS ci ON i.code = ci.ind_code
       WHERE ci.comp_code = $1`, [code]);

    const company = compResult.rows[0];
    company.invoices = invResult.rows.map(inv => inv.id);
    company.industries = indResult.rows.map(ind => ind.industry);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});


// POST /companies
const slugify = require("slugify");

router.post("/", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true, strict: true });
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /companies/[code]
router.put("/:code", async function (req, res, next) {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
      [name, description, code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code ${code} not found`, 404);
    }

    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE /companies/[code]
router.delete("/:code", async function (req, res, next) {
  try {
    const { code } = req.params;
    const result = await db.query(
      "DELETE FROM companies WHERE code = $1 RETURNING code",
      [code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code ${code} not found`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
