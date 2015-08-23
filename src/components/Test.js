import React from "react";
import Component from "../Component";
import SansSel from "../sans-sel";
import types from "../types";
import warning from "../icons/warning.svg"; // eslint-disable-line import/default


@SansSel
export default class Test extends Component {

  static propTypes = {
    group: types.group.isRequired,
    test: types.test.isRequired,
  };

  static styles = {
    root: {
    },

    name: {
      padding: "10px 10px 0",
    },

    script: {
      margin: "0",
      padding: "10px",
      whiteSpace: "pre-wrap",
      backgroundColor: "#eee",
    },

    supports: {
      display: "flex",
      flexWrap: "wrap",
    },

    support: {
      position: "relative",
      margin: "2px",
      padding: "5px 10px",
      fontSize: ".8em",
      textAlign: "center",
      color: "#fff",
    },

    pass: {
      backgroundColor: "#27AE60",
    },

    fail: {
      backgroundColor: "#C0392B",
    },

    note: {
      display: "inline-block",
      verticalAlign: "top",
      right: "3px",
      fontSize: "1.2em",
      fontWeight: "bold",
      backgroundImage: `url(${warning})`,
      width: "16px",
      height: "16px",
    },

  };

  getProjects() {
    let result = [];
    for (let version of this.props.group.versions) {
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

  getSupports() {
    return this.getProjects().map(({ project, versions }) => {
      let supports = this.props.test.supports.filter((support) => support.version.project === project);
      if (!supports.length) {
        supports.push({ pass: false, version: versions[0] });
      }
      return { project, supports };
    });
  }

  renderSupport(project, supports) {
    let referenceSupport;
    for (let support of supports.reverse()) {
      if (support.version.unstable) continue;
      referenceSupport = support;
      break;
    }

    if (!referenceSupport) referenceSupport = supports[0];

    return (
      <div ss={[ "support", referenceSupport.pass ? "pass" : "fail" ]} title={referenceSupport.note}>
        {project.name}
        {" "}
        {referenceSupport.version.number}
        {referenceSupport.note && <span ss="note" />}
      </div>
    );
  }

  renderSupports() {
    return (
      <div ss="supports">

        {this.getSupports().map(
          ({ project, supports }) => this.renderSupport(project, supports)
        )}
      </div>
    );
  }

  render() {
    let test = this.props.test;
    /*eslint-disable no-console*/
    return (
      <div ss="root" onClick={() => console.log(test)}>
        <div ss="name">{test.name} {this.renderSupports()}</div>
        {test.exec.map(
          (exec, i) => (
            <pre key={i} ss="script">{exec.script}</pre>
          )
        )}
      </div>
    );
    /*eslint-enable no-console*/
  }

}
