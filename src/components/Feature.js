let React = require("react");
let FeatureClass = require("../Feature");
let Test = require("./Test");
let Component = require("../Component");

class Feature extends Component {

  render() {
    let feature = this.props.feature;
    return <div>
      {feature.group} {feature.name}
      {feature.tests.map(test => <Test key={test.name} test={test} />)}
    </div>;
  }

}

Feature.propTypes = {
  feature: React.PropTypes.instanceOf(FeatureClass).isRequired,
};

module.exports = Feature;
