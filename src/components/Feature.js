import React from "react";
import SansSel from "../sans-sel";
import Component from "../Component";

@SansSel
export default class Feature extends Component {

  static propTypes = {
    feature: React.PropTypes.object.isRequired,
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
      flexWrap: "wrap",
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

    name: {
      inherit: "cell",

      flexShrink: 1,
      minWidth: "6ch",
    },

    support: {
      inherit: "cell",

      textAlign: "right",
      flex: 1,
      whiteSpace: "nowrap",
      minWidth: "min-content",
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
      <span>
        {test.name}
        {test.exec.map(
          (exec, i) => (
            <pre key={i}>{exec.script}</pre>
            )
        )}
      </span>
    );
  }

  renderTests() {
    let tests = this.props.feature.tests;
    if (tests.length === 1) return this.renderTest(tests[0]);

    return (
      <ul>
        {tests.map(
          (test, i) => <li key={i}>{this.renderTest(test)}</li>
        )}
      </ul>
    );
  }

  render() {
    let feature = this.props.feature;

    return (
      <div ss="root">
        <div ss="head" onClick={() => this.toggle()}>
          <span ss="group">{feature.group.name}</span>
          <span ss="name">{feature.name}</span>
          <span ss="support"></span>
        </div>
        {this.state.open && this.renderTests()}
      </div>
    );
  }

}
