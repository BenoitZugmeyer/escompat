import React from "react";

let { shape, arrayOf, string, bool, oneOf, oneOfType } = React.PropTypes;

let runtime =
  shape({
    name: string.isRequired,
  });

let project =
  shape({
    link: string.isRequired,
    name: string.isRequired,
    runtime,
    type: string.isRequired,
  });

let version =
  shape({
    number: string,
    project: project.isRequired,
    unstable: bool.isRequired,
    obsolete: bool.isRequired,
  });

let support =
  shape({
    note: oneOfType([ bool, string ]),
    pass: oneOf([ true, false, "mixed" ]).isRequired,
    version: version.isRequired,
  });

let test =
  shape({
    exec: arrayOf(shape({
      script: string.isRequired,
      type: string,
    })),
    supports: arrayOf(support),
    name: string,
  });

let group =
  shape({
    name: string.isRequired,
    versions: arrayOf(version),
  });

let feature =
  shape({
    name: string.isRequired,
    group: group.isRequired,
    tests: arrayOf(test).isRequired,
  });

export default {
  runtime,
  project,
  version,
  support,
  test,
  group,
  feature,
  ...React.PropTypes,
};
