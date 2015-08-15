import escapeRegExp from "./escapeRegExp";

function mkFilter(field, filter) {
  if (!filter) {
    filter = field;
    field = undefined;
  }
  return { type: "Filter", field, filter };
}

function mkOperator(operator, children=[]) {
  return { type: "Operator", operator, children };
}

function mkGroup(children=[]) {
  return { type: "Group", children };
}

function tokenize(query) {
  let index = 0;

  let next = () => {
    index++;
    return query[index];
  };

  let current = () => query[index];
  let pop = (ch) => {
    let c = current();
    if (!ch || c === ch) {
      next();
      return c;
    }
  };

  let isSpace = (ch) => ch === " ";
  let isWordCharacter = (ch) => ch && !isSpace(ch) && ch !== ":" && ch !== ")" && ch !== "(";
  let isOperator = (op) => ["or", "and", "not"].indexOf(op) >= 0;

  let skipSpaces = () => {
    while (isSpace(current())) next();
  };

  let parseWord = () => {
    skipSpaces();
    let result = "";
    while (isWordCharacter(current())) result += pop();
    return result;
  };

  let parseGroup = () => {
    let result = [];

    while (true) {
      let word = parseWord();

      if (word) {
        let potentialOperator = word.toLowerCase();
        if (isOperator(potentialOperator)) {
          result.push(mkOperator(potentialOperator));
        }
        else {
          result.push(mkFilter(word, pop(":") && parseWord()));
        }
      }

      else if (pop("(")) {
        result.push(mkGroup(parseGroup()));
        pop(")");
      }

      else break;
    }

    return result;
  };

  return parseGroup();
}

function normalize(query) {
  let group = mkOperator("and");
  let root = group;
  let previousPart;

  function up() {
    group = group.parent;
  }

  function transitionToAnd() {
    let parent = group;
    group = mkOperator("and", [group.children.pop()]);
    group.parent = parent;
    parent.children.push(group);
  }

  function transitionToNot() {
    let parent = group;
    group = mkOperator("not");
    group.parent = parent;
    parent.children.push(group);
  }

  function transitionToOr() {
    let child = group;
    group = mkOperator("or", [child]);
    group.parent = child.parent;
    if (!child.parent) root = group;
    child.parent = group;
  }

  function transitionToAndWithoutOperator() {
    if (previousPart && previousPart.type !== "Operator" && group.operator === "or") {
      transitionToAnd();
    }
  }

  function popNotGroup() {
    if (group.operator === "not" && group.children.length > 0) up();
  }

  for (let part of query) {

    switch (part.type) {

    case "Filter":
      popNotGroup();
      transitionToAndWithoutOperator();
      group.children.push(part);
      break;

    case "Operator":

      if (part.operator === "not") {
        transitionToAndWithoutOperator();

        if (group.operator === "not") {
          up();
          group.children.pop();
        }
        else {
          transitionToNot();
        }
      }
      else {

        if (group.operator === "not") up();

        if (part.operator !== group.operator) {
          if (group.children.length < 2) {
            group.operator = part.operator;
          }
          else if (part.operator === "or") {
            transitionToOr();
          }
          else if (part.operator === "and") {
            transitionToAnd();
          }
          else {
            throw new Error(`Should not pass here`);
          }
        }

      }
      break;

    case "Group":
      popNotGroup();
      transitionToAndWithoutOperator();

      let subGroup = normalize(part.children);
      if (subGroup.operator === group.operator || subGroup.children.length < 2) {
        group.children.push(...subGroup.children);
      }
      else {
        group.children.push(subGroup);
      }

    }

    previousPart = part;
  }

  return root;
}

function compileFilters(query, options) {
  if (query.type === "Filter") {
    let filter = escapeRegExp(query.filter);
    if (!query.field) query.field = options.defaultField;
    let matchSpace = !options.fields.hasOwnProperty(query.field) || options.fields[query.field].matchSpace !== false;
    filter = filter.replace(/(\\.|[^\\])(?=.)/g, matchSpace ? "$1[^$1]*?" : "$1[^$1 ]*?");
    query.re = new RegExp(filter, "i");
  }
  else if (query.children) {
    for (let child of query.children) compileFilters(child, options);
  }
}


function match(query, obj, options) {
  if (query.type === "Operator") {
    let score = 0;
    for (let child of query.children) {
      let childScore = match(child, obj, options);
      if (query.operator === "and" && childScore === 0) {
        score = 0;
        break;
      }

      if (query.operator === "not") {
        childScore = childScore > 0 ? 0 : 1;
      }

      score += childScore;
    }

    return score;
  }

  let { field=options.defaultField, re } = query;

  if (!obj.hasOwnProperty(field)) return 0;

  let m = re.exec(obj[field]);

  if (!m) return 0;

  return 1000 - m[0].length - obj[field].length / 1000;
}

export default class Query {
  constructor(query, options) {
    this._parsed = normalize(tokenize(query));
    compileFilters(this._parsed, options);
  }

  match(obj) {
    return match(this._parsed, obj);
  }
}


if (process.env.NODE_ENV === "tests") {

  let assert = require("assert");

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
    assert.equal(format(ast), expected);
  };

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

  console.log("tests ok");
}

