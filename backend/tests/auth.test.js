const request = require("supertest");
const app = require("../src/app");

describe("Auth API", () => {
  it("should register user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "123456",
      name: "Test"
    });

    expect(res.statusCode).toBe(201);
  });
});
