jest.dontMock("../itertools");
const itertools = require("../itertools");

function collect(iterable) {
  return [ for (value of iterable) value ];
}

describe("itertools", () => {

  describe("all", () => {
    let all = itertools.all;

    it("returns true if everything is true", function () {
      expect([ 1, 2, 3 ]::all((n) => n > 0)).toBe(true);
    });

    it("returns false if somehing is false", function () {
      expect([ 1, 0, 3 ]::all((n) => n > 0)).toBe(false);
    });

    it("returns true if there is no value", function () {
      expect([]::all((n) => n > 0)).toBe(true);
    });

  });

  describe("some", () => {
    let some = itertools.some;

    it("returns true if something is true", function () {
      expect([ 0, 2, 0 ]::some((n) => n > 0)).toBe(true);
    });

    it("returns false if everything is false", function () {
      expect([ 0, 0, 0 ]::some((n) => n > 0)).toBe(false);
    });

    it("returns false if there is no value", function () {
      expect([]::some((n) => n > 0)).toBe(false);
    });

  });

  describe("groupBy", () => {
    let { groupBy } = itertools;

    it("groups", function () {
      let result = [ 1, 2, 3 ]::groupBy((n) => n > 2);

      expect([for ([ key, values ] of result) [ key, collect(values) ]]).toEqual([
        [ false, [ 1, 2 ] ],
        [ true, [ 3 ] ],
      ]);

    });

  });

  describe("map", () => {
    let { map } = itertools;

    it("maps", function () {
      expect(collect([ 1, 2, 3 ]::map((n) => n + 1))).toEqual([ 2, 3, 4 ]);
    });
  });

});
