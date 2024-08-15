const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
});

afterAll(async function () {
  await db.end();
});

describe("POST /companies", function () {
  test("Creates a new company with a slugified code", async function () {
    const response = await request(app)
      .post("/companies")
      .send({
        name: "New Company",
        description: "This is a new company."
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      company: {
        code: "new-company",
        name: "New Company",
        description: "This is a new company."
      }
    });

    // Check if the company was added to the database
    const result = await db.query("SELECT * FROM companies WHERE code = 'new-company'");
    expect(result.rows.length).toBe(1);
    expect(result.rows[0]).toEqual({
      code: "new-company",
      name: "New Company",
      description: "This is a new company."
    });
  });
});
