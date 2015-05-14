let React = require("react");
let TestClass = require("../Test");
let TestResults = require("./TestResults");
let Component = require("../Component");

class Test extends Component {

  render() {
    let test = this.props.test;
    return <div onClick={() => console.log(test)}>
        {!test.main && test.name}
        <TestResults results={test.results} />
      </div>;
  }

}

Test.propTypes = {
  test: React.PropTypes.instanceOf(TestClass).isRequired,
};

module.exports = Test;
