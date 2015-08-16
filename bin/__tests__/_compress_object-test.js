jest.dontMock("../_compress_object");

const compressObject = require("../_compress_object");

describe('compressObject', function () {

  function test(obj) {
    let result = compressObject(obj);
    let b;
    eval(`b = ${result}`);
    expect(obj).toEqual(b);
  }

  it('reduce multiple references', function () {
    let a = { v: "va" };
    let b = { v: "vb", };
    test([ a, a, b, b ]);
  });

});
