import React from "react";
import TestClass from "../Test";
import TestResults from "./TestResults";
import Component from "../Component";

export default class Test extends Component {

  static propTypes = {
    test: React.PropTypes.instanceOf(TestClass).isRequired,
  };

  render() {
    let test = this.props.test;
    /*eslint-disable no-console*/
    return (
      <div onClick={() => console.log(test)}>
        {!test.main && test.name}
        <TestResults results={test.results} />
      </div>
    );
    /*eslint-enable no-console*/
  }

}
