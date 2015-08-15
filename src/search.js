import data from "./data";
import Query from "./query";

export default function search(query) {
  query = query && query.trim();
  if (!query) return data;

  query = new Query(query, {
    fields: {
      browser: { matchSpace: false },
    },
    defaultField: "name",
  });

  let scores = new Map();
  let result = [];
  data.forEach((feature, i) => {
    let score = query.match({
      name: feature.name,
      group: feature.group.name,
    });
    if (score) {
      score -= i / 1e5;  // to have a stable sort
      scores.set(feature, score);
      result.push(feature);
    }
  });

  result.sort((a, b) => scores.get(b) - scores.get(a));

  return result;
}
