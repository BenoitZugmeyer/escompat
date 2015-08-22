import React from "react";
import SansSel from "../sans-sel";
import Component from "../Component";
import Test from "./Test";
import types from "../types";

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
          (test, i) => <Test key={i} test={test} />
        )}
      </div>
    );
  }

  render() {
    let feature = this.props.feature;

    return (
      <div ss="root">
        <div ss="head" onClick={() => this.toggle()}>
          <span ss="group">{feature.group.name}</span>
          <span ss="nameSupport">
            <span ss="name">{feature.name}</span>
            <span ss="support"></span>
          </span>
        </div>
        {this.state.open && this.renderTests()}
      </div>
    );
  }

}
