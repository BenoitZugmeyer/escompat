let React = require("react");
let FeatureClass = require("../Feature");

class Feature extends React.Component {

  render() {
    let feature = this.props.feature;
    return <div>
      {feature.group} {feature.name}
    </div>;
  }

}

Feature.propTypes = {
  feature: React.PropTypes.instanceOf(FeatureClass).isRequired,
};

module.exports = Feature;
