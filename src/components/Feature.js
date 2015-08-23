import React from "react";
import SansSel from "../sans-sel";
import Component from "../Component";
import Test from "./Test";
import Supports from "./Supports";
import types from "../types";
import { getSupportsByProject, getReferenceSupport } from "../supports";

@SansSel
export default class Feature extends Component {

  static propTypes = {
    feature: types.feature.isRequired,
  };

  static styles = {

    root: {
      borderBottom: "1px solid #888",
      "first-child": {
        //borderTop: "1px solid #888",
      },
    },

    head: {
      display: "flex",
      cursor: "pointer",
      userSelect: "none",
    },

    cell: {
      padding: "10px 5px",
    },

    group: {
      inherit: "cell",

      backgroundColor: "#eee",
      width: "12ch",
      color: "#888",
      textAlign: "center",
      marginRight: 10,
      flexShrink: 0,
    },

    nameSupport: {
      display: "flex",
      flexWrap: "wrap",
      flex: 1,
    },

    name: {
      inherit: "cell",

      flexShrink: 1,
      minWidth: "6ch",
      paddingBottom: 0,
    },

    support: {
      inherit: "cell",

      textAlign: "right",
      flex: 1,
      minWidth: "20ch",
    },

    tests: {
      paddingBottom: "10px",
    },

  };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  toggle() {
    this.setState((previous) => ({ open: !previous.open }));
  }

  computeSupports() {
    let feature = this.props.feature;
    let versions = feature.group.versions;

    function compareVersions(versions, va, vb) {
      if (va === vb) return 0;
      return versions.indexOf(va) - versions.indexOf(vb);
    }

    let map = new Map();
    feature.tests.forEach((test) => {
      getSupportsByProject(versions, test.supports).forEach(({ project, supports }) => {
        let support = getReferenceSupport(supports);
        let previousSupport = map.get(project);
        if (!previousSupport) map.set(project, support);
        else {
          let newVersionIsMoreRecent = compareVersions(versions, previousSupport.version, support.version) < 0;
          let version =
            support.pass && newVersionIsMoreRecent ?
              support.version :
              previousSupport.version;
          let pass = support.pass === previousSupport.pass ? support.pass : "mixed";
          let note = Boolean(support.note || previousSupport.note);

          map.set(project, { pass, version, note });
        }
      });
    });

    return [for (value of map.values()) value];
  }

  renderTest(test) {
    return (
      <div ss="exec">
        <div ss="execName">{test.name}</div>
        {test.exec.map(
          (exec, i) => (
            <pre key={i} ss="execScript">{exec.script}</pre>
          )
        )}
      </div>
    );
  }

  renderTests() {
    return (
      <div ss="tests">
        {this.props.feature.tests.map(
          (test, i) => <Test key={i} test={test} group={this.props.feature.group} />
        )}
      </div>
    );
  }

  render() {
    let feature = this.props.feature;
    let supports = this.computeSupports();

    return (
      <div ss="root">
        <div ss="head" onClick={() => this.toggle()}>
          <span ss="group">{feature.group.name}</span>
          <span ss="nameSupport">
            <span ss="name">{feature.name}</span>
            <span ss="support">
              <Supports group={feature.group} supports={supports} />
            </span>
          </span>
        </div>
        {this.state.open && this.renderTests()}
      </div>
    );
  }

}
