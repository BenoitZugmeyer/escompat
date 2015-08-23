import React from "react";
import Component from "../Component";
import SansSel from "../sans-sel";
import types from "../types";
import Supports from "./Supports";


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

  };

  render() {
    let test = this.props.test;
    /*eslint-disable no-console*/
    return (
      <div ss="root" onClick={() => console.log(test)}>
        <div ss="name">
          {test.name}
          <Supports group={this.props.group} supports={test.supports} />
        </div>
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
