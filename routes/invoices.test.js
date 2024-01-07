const request = require("supertest");

const app = require("../app");
const {createData} = require("../_test-db");
const db = require("../db");

beforeEach(createData);

afterAll(async() => {
    await db.end()
})

describe("GET /", function () {
    
    test("Array of Invoices", async function () {
        const response = await request(app).get("/invoices")

        expect(response.body).toEqual({
            "invoices": [
                {id:1, comp_code: "apple", add_date: "2018-01-01T05:00:00.000Z", amt: 100, paid: false, paid_date: null},
                {id:2, comp_code: "apple", add_date: "2018-02-01T05:00:00.000Z", amt: 200, paid: true, paid_date: "2018-02-02T05:00:00.000Z"},
                {id:3, comp_code: "ibm", add_date: "2018-03-01T05:00:00.000Z", amt: 300, paid: false, paid_date: null},
            ]
        });
    })
});

describe("GET /1", function () {

    test("It return invoice info", async function () {
        const response = await request(app).get("/invoices/1");
        expect(response.body).toEqual(
            {
              "invoice": {
                id: 1,
                amt: 100,
                add_date: "2018-01-01T05:00:00.000Z",
                paid: false,
                paid_date: null,
                comp_code: 'apple',
              }
            }
        );
      });

    test("Return 404 for no invoice", async function () {
        const response = await request(app).get("/invoices/0");
        expect(response.status).toEqual(404);
    })
});

describe("POST /", function () {

    test("Add Invoice", async function () {
        const response = await request(app)
            .post("/invoices")
            .send({amt: 400, comp_code: "ibm"});

        expect(response.body).toEqual({
            "invoice": {
                id: 4,
                comp_code: "ibm",
                amt: 400,
                add_date: expect.any(String),
                paid: false,
                paid_date: null,
              }
        });
    });
});

describe("PUT /", function () {

    test("Update Invoice", async function () {
        const response = await request(app)
            .put("/invoices/1")
            .send({amt: 500, paid: false});

        expect(response.body).toEqual(
            {
                "invoice": {
                  id: 1,
                  comp_code: 'apple',
                  paid: false,
                  amt: 500,
                  add_date: expect.any(String),
                  paid_date: null,
                }
              }
        );
    });

    test("Return 404 for no invoice", async function () {
        const response = await request(app)
            .put("/invoices/0")
            .send({amt:500});
        
        expect(response.status).toEqual(404);
    });

    test("Return 500 for missing data", async function () {
        const response = await request(app)
            .put("/invoices/1")
            .send({});

        expect(response.status).toEqual(500);
    });
});


describe("DELETE /", function () {

    test("Delete Invoice", async function () {
        const response = await request(app)
            .delete("/invoices/1")
        
        expect(response.body).toEqual({status: "deleted"});
    })

    test("Return 404 for no invoice", async function () {
        const response = await request(app)
            .delete("/invoices/0")

        expect(response.status).toEqual(404);
    });
});