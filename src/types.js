import React from "react";
import { collect } from "./itertools";

let { shape, arrayOf, string, bool, oneOf, oneOfType } = React.PropTypes;

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location) {
    componentName = componentName || "anonymous";
    if (props[propName] == null) {
      if (isRequired) {
        return new Error(`Required \`${propName}\` was not specified in \`${componentName}\`.`);
      }
      return null;
    }

    return validate(props, propName, componentName, location);
  }

  let chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}


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

let setOf =
  (typeChecker) =>
    createChainableTypeChecker((props, propName, componentName, location) => {
      let propValue = props[propName];
      if (!(propValue instanceof Set)) {
        return new Error(`Invalid type for ${propName} supplied to ${componentName}, expected a Set`);
      }

      return arrayOf(typeChecker)(
        { [propName]: propValue::collect() },
        propName,
        componentName,
        location
      );
    });


export default {
  runtime,
  project,
  version,
  support,
  test,
  group,
  feature,
  setOf,
  ...React.PropTypes,
};
