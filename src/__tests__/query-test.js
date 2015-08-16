jest.dontMock("../query");

const {
  _test_normalize: normalize,
  _test_tokenize: tokenize,
} = require("../query");

describe('query', function () {

  let format = (ast) => {
    if (Array.isArray(ast)) return ast.map(format).join(" ");

    switch (ast.type) {
    case "Group":
      return `( ${format(ast.children)} )`;
    case "Filter":
      return ast.field ? `${ast.field}:${ast.filter}` : ast.filter;
    case "Operator":
      return ast.children.length ? `${ast.operator}( ${format(ast.children)} )` : ast.operator;
    }
  };

  let assertAST = (ast, expected) => {
    expect(format(ast)).toBe(expected);
  };

  it('tokenizes', () => {
    assertAST(tokenize(""),
              "");

    assertAST(tokenize("blah"),
              "blah");

    assertAST(tokenize("blah blih"),
              "blah blih");

    assertAST(tokenize("blah (blih)"),
              "blah ( blih )");

    assertAST(tokenize("(blah) blih"),
              "( blah ) blih");

    assertAST(tokenize("blah ) blih"),
              "blah");

    assertAST(tokenize("blah ( blih"),
              "blah ( blih )");

    assertAST(tokenize("blah:bluh"),
              "blah:bluh");

    assertAST(tokenize("not blah"),
              "not blah");

  });

  it('normalizes', () => {
    assertAST(normalize(tokenize("blah")),
              "and( blah )");

    assertAST(normalize(tokenize("not blah")),
              "and( not( blah ) )");

    assertAST(normalize(tokenize("not not blah")),
              "and( blah )");

    assertAST(normalize(tokenize("blah blih")),
              "and( blah blih )");

    assertAST(normalize(tokenize("blah not blih")),
              "and( blah not( blih ) )");

    assertAST(normalize(tokenize("blah not blih bluh")),
              "and( blah not( blih ) bluh )");

    assertAST(normalize(tokenize("blah not blih and bluh")),
              "and( blah not( blih ) bluh )");

    assertAST(normalize(tokenize("blah or not blih bluh")),
              "or( blah and( not( blih ) bluh ) )");

    assertAST(normalize(tokenize("blah not blih or bluh")),
              "or( and( blah not( blih ) ) bluh )");

    assertAST(normalize(tokenize("blah or blih")),
              "or( blah blih )");

    assertAST(normalize(tokenize("blah or blih or bluh")),
              "or( blah blih bluh )");

    assertAST(normalize(tokenize("blah or blih bluh")),
              "or( blah and( blih bluh ) )");

    assertAST(normalize(tokenize("blah or blih and bluh")),
              "or( blah and( blih bluh ) )");

    assertAST(normalize(tokenize("blah blih or bluh")),
              "or( and( blah blih ) bluh )");

    assertAST(normalize(tokenize("(blah blih) or bluh")),
              "or( and( blah blih ) bluh )");

    assertAST(normalize(tokenize("(blah) or blih")),
              "or( blah blih )");

    assertAST(normalize(tokenize("blah or blih not bluh")),
              "or( blah and( blih not( bluh ) ) )");

    assertAST(normalize(tokenize("blah or blih ( bluh bleh )")),
              "or( blah and( blih bluh bleh ) )");

  });
});
