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
    projects: types.setOf(types.project).isRequired,
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
    this._versions = props.feature.group.versions.filter((version) => props.projects.has(version.project));
  }

  toggle() {
    this.setState((previous) => ({ open: !previous.open }));
  }

  componentWillReceiveProps(nextProps) {
    this._versions = nextProps.feature.group.versions.filter((version) => nextProps.projects.has(version.project));
  }

  computeSupports() {
    let feature = this.props.feature;

    let compareVersions = (va, vb) => {
      if (va === vb) return 0;
      return this._versions.indexOf(va) - this._versions.indexOf(vb);
    };

    let map = new Map();
    feature.tests.forEach((test) => {
      for (let [ project, supports ] of getSupportsByProject(this._versions, test.supports)) {
        let support = getReferenceSupport(supports);
        let previousSupport = map.get(project);
        if (!previousSupport) map.set(project, support);
        else {
          let newVersionIsMoreRecent = compareVersions(previousSupport.version, support.version) < 0;
          let version =
            support.pass && newVersionIsMoreRecent ?
              support.version :
              previousSupport.version;
          let pass = support.pass === previousSupport.pass ? support.pass : "mixed";
          let note = Boolean(support.note || previousSupport.note);

          map.set(project, { pass, version, note });
        }
      }
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
          (test, i) => <Test key={i} test={test} versions={this._versions} />
        )}
      </div>
    );
  }

  render() {
    let feature = this.props.feature;
    let supports = this.computeSupports();

    return (
      <div ss="root">
        <div ss="head" onClick={::this.toggle}>
          <span ss="group">{feature.group.name}</span>
          <span ss="nameSupport">
            <span ss="name">{feature.name}</span>
            <span ss="support">
              <Supports versions={this._versions} supports={supports} />
            </span>
          </span>
        </div>
        {this.state.open && this.renderTests()}
      </div>
    );
  }

}
