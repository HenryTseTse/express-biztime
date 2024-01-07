const request = require("supertest");
const app = require("../app");
const { createData } = require("../_test-db");
const db = require("../db");

beforeEach(createData);

afterAll(async () => {
    await db.end()
})

describe("GET /", function () {

    test("Respond with Array of Companies", async function () {
        const response = await request(app).get("/companies");
        expect(response.body).toEqual({
            "companies": [
                {code: "apple", "description": "Maker of OSX.", name: "Apple"},
                {code: "ibm", "description": "Big blue.", name:"IBM"},
            ]
        });
    })
});

describe("GET /apple", function() {

    test("Return company info", async function () {
        const response = await request(app).get("/companies/apple");
        expect(response.body).toEqual(
            {
                "companies": {
                    code: "apple",
                    name: "Apple",
                    description: "Maker of OSX.",
                    invoices: [1, 2],
                }
            }
        )
    })

    test("Return 404 for no company", async function () {
        const response = await request(app).get("/companies/abc");
        expect(response.status).toEqual(404);
    })
});

describe("POST /", function () {

    test("Add Company", async function () {
        const response = await request(app)
            .post("/companies")
            .send({name: "Google", description: "search engine"});
    
        expect(response.body).toEqual(
            {
                "company": {
                    code: "google",
                    name: "Google",
                    description: "search engine",
                }
            }
        );
    })

    test("Return 500 for conflict", async function () {
        const response = await request(app)
            .post("/companies")
            .send({name: "Apple", description: "abc"});
        
        expect(response.status).toEqual(500);
    })
});

describe("PUT /", function () {

    test("Update Company", async function () {
        const response = await request(app)
            .put("/companies/apple")
            .send({name: "AppleEdited", description: "NewDescription"});

        expect(response.body).toEqual(
            {
                "company": {
                    code: "apple",
                    name: "AppleEdited",
                    description: "NewDescription",
                }
            }
        );
    });

    test("404 for no company", async function () {
        const response = await request(app)
            .put("/companies/abc")
            .send({name: "ABC"});

        expect(response.status).toEqual(404);
    });

    test("500 for missing data", async function () {
        const response = await request(app)
            .put("/companies/apple")
            .send({});
    
        expect(response.status).toEqual(500);
    })
});

describe("DELETE /", function () {

    test("Delete Company", async function () {
        const response = await request(app)
            .delete("/companies/apple");
        
        expect(response.body).toEqual({"status": "deleted"});
    });

    test("Return 404 for no company", async function () {
        const response = await request(app)
            .delete("/companies/abc");

        expect(response.status).toEqual(404);
    });
});