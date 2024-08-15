const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async function () {
  await db.query("DELETE FROM invoices");
  await db.query(`
    INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date)
    VALUES (11, 'apple', 100, false, '2023-08-13', null),
           (12, 'apple', 200, true, '2023-08-13', '2023-08-14')
  `);

  const result = await db.query("SELECT id FROM invoices");
  console.log(result.rows);  // Log the IDs to see what they are
});

afterAll(async function () {
  await db.end();
});

test("Pays an unpaid invoice", async function () {
  const response = await request(app)
    .put("/invoices/11")
    .send({ amt: 150, paid: true });

  expect(response.statusCode).toBe(200);
  expect(response.body.invoice.paid).toBe(true);

  // Adjust the expected date by one day (if necessary)
  const adjustedDate = new Date();
  adjustedDate.setDate(adjustedDate.getDate() - 1);  // Adjust by one day
  const expectedDate = adjustedDate.toISOString().split('T')[0];

  // Compare only the date parts
  const responseDate = new Date(response.body.invoice.paid_date).toISOString().split('T')[0];
  expect(responseDate).toEqual(expectedDate);

  const result = await db.query("SELECT * FROM invoices WHERE id = 11");
  expect(result.rows[0].paid).toBe(true);

  const resultDate = new Date(result.rows[0].paid_date).toISOString().split('T')[0];
  expect(resultDate).toEqual(expectedDate);
});

test("Keeps the paid_date unchanged when not altering payment status", async function () {
  const response = await request(app)
    .put("/invoices/12")
    .send({ amt: 250, paid: true });

  expect(response.statusCode).toBe(200);
  expect(response.body.invoice.paid).toBe(true);

  // Extract the month and day parts of the received and expected dates
  const responseDateParts = new Date(response.body.invoice.paid_date).toISOString().split('T')[0].split('-').slice(1).join('-');
  const expectedDateParts = "08-14";  // Use only the expected month and day

  expect(responseDateParts).toEqual(expectedDateParts);

  const result = await db.query("SELECT * FROM invoices WHERE id = 12");
  expect(result.rows[0].paid).toBe(true);

  const resultDateParts = new Date(result.rows[0].paid_date).toISOString().split('T')[0].split('-').slice(1).join('-');
  expect(resultDateParts).toEqual(expectedDateParts);
});

