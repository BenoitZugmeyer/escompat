import { groupBy, map } from "./itertools";

export function getSupportsByProject(versions, rawSupports) {
  return versions
    ::groupBy((version) => version.project)
    ::map(([ project, versions ]) => {
      let supports = rawSupports.filter((support) => support.version.project === project);
      if (!supports.length) {
        supports.push({ pass: false, version: versions.next().value });
      }
      return [ project, supports ];
    });
}

export function getReferenceSupport(supports) {
  for (let support of supports.reverse()) {
    if (!support.version.unstable) return support;
  }

  return supports[0];
}
