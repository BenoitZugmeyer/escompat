export default function levenshtein(m, n) {

  if (m === n) return 0;
  if (m === "") return n.length;
  if (n === "") return m.length;

  let previous = [ 0 ];
  for (let i = 1; i <= m.length; i++) previous[i] = i;

  let matrix = [previous];
  let current;

  for (let indexN = 0; indexN < n.length; indexN++) {
    current = [ indexN + 1 ];
    for (let indexM = 0; indexM < m.length; indexM++) {
      if (m[indexM] === n[indexN]) {
        current[indexM + 1] = previous[indexM];
      }
      else {
        current[indexM + 1] = Math.min(
          previous[indexM + 1 ] + 1,   // Deletion
          current[indexM] + 1,         // Insertion
          previous[indexM] + 1         // Subtraction
        );
      }
    }
    previous = current;
    matrix[matrix.length] = previous;
  }

  return current[current.length - 1];
}

if (process.env.NODE_ENV === "tests") {
  let assert = require("assert");

  assert.equal(levenshtein("kitten", "sitting"), 3);
  assert.equal(levenshtein("Saturday", "Sunday"), 3);

  console.log("tests ok");
}
