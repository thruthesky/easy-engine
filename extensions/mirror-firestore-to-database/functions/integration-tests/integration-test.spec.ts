import axios from "axios";
import { expect } from "chai";
import { describe } from "mocha";

describe("greet-the-world", () => {
  it("should respond with the configured greeting", async () => {
    const expected = "Hello World from greet-the-world";

    const httpFunctionUri = "http://localhost:5001/demo-test/us-central1/ext-greet-the-world-greetTheWorld/";
    const res = await axios.get(httpFunctionUri);

    return expect(res.data).to.eql(expected);
  }).timeout(10000);
});
