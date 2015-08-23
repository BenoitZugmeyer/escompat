function getProjects(versions) {
  let result = [];
  for (let version of versions) {
    let lastEntry = result[result.length - 1];
    if (!lastEntry || lastEntry.project !== version.project) {
      result.push({
        project: version.project,
        versions: [ version ],
      });
    }
    else {
      lastEntry.versions.push(version);
    }
  }
  return result;
}

export function getSupportsByProject(versions, rawSupports) {
  return getProjects(versions).map(({ project, versions }) => {
    let supports = rawSupports.filter((support) => support.version.project === project);
    if (!supports.length) {
      supports.push({ pass: false, version: versions[0] });
    }
    return { project, supports };
  });
}

export function getReferenceSupport(supports) {
  for (let support of supports.reverse()) {
    if (!support.version.unstable) return support;
  }

  return supports[0];
}
