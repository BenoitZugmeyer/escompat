jest.dontMock("../levenshtein");
const levenshtein = require("../levenshtein");

describe("levenshtein", function () {
  it("should return correct values", function () {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("Saturday", "Sunday")).toBe(3);
  });
});
