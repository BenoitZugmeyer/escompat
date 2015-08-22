import React from "react";
import Component from "../Component";
import SansSel from "../sans-sel";


@SansSel
export default class Test extends Component {

  static propTypes = {
    test: React.PropTypes.instanceOf(TestClass).isRequired,
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

  };

  renderSupports() {
    return (
      <div>
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
