import React from "react";
import Component from "../Component";
import SansSel from "../sans-sel";
import types from "../types";
import Supports from "./Supports";


@SansSel
export default class Test extends Component {

  static propTypes = {
    test: types.test.isRequired,
    versions: types.arrayOf(types.version).isRequired,
  };

  static styles = {
    root: {
    },

    name: {
      padding: "10px 5px 0",
      display: "flex",
    },

    script: {
      margin: "0",
      padding: "10px",
      whiteSpace: "pre-wrap",
      backgroundColor: "#eee",
    },

    supports: {
      flex: 1,
      minWidth: "20ch",
    },

  };

  render() {
    let test = this.props.test;
    /*eslint-disable no-console*/
    return (
      <div ss="root" onClick={() => console.log(test)}>
        <div ss="name">
          <div>{test.name}</div>
          <div ss="supports">
            <Supports supports={test.supports} versions={this.props.versions} />
          </div>
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
