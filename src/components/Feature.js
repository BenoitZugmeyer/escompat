let React = require("react");
let FeatureClass = require("../Feature");
let Component = require("../Component");

function mixColors(c1, c2, p) {
  return `hsl(
    ${c1[0] * p + c2[0] * (1 - p)},
    ${c1[1] * p + c2[1] * (1 - p)}%,
    ${c1[2] * p + c2[2] * (1 - p)}%
  )`;
}

function percent(n) {
  return Math.round(n * 100) + "%";
}

class Feature extends Component {

  render() {
    let feature = this.props.feature;
    let groupStyle = {
      color: "#888",
    };
    let supports = [];
    let previousSupport;
    for (let support of feature.supports) {
      if (!previousSupport ||
          previousSupport.browser.shortId !== support.browser.shortId ||
          previousSupport.score !== support.score ||
          previousSupport.optionalScore !== support.optionalScore) {
        supports.push(support);
      }

      previousSupport = support;
    }

    return <div>
      <span style={groupStyle}>{feature.group}</span> {feature.name}
      <ul>
        {supports.map(s => this.renderSupport(s))}
      </ul>
    </div>;
  }

  renderSupport(support) {
    let supported = [89, 56, 62];
    let notSupported = [10, 97, 65];

    let style = {
      backgroundColor: mixColors(supported, notSupported, support.score),
    };

    let optionalStyle = {
      backgroundColor: mixColors(supported, notSupported, support.optionalScore),
    };

    return <li key={support.browser.id} style={style}>
      {support.browser.short}: {percent(support.score)}
      &nbsp;
      {support.score !== support.optionalScore && <span style={optionalStyle}>({percent(support.optionalScore)})</span>}
    </li>;
  }

}

Feature.propTypes = {
  feature: React.PropTypes.instanceOf(FeatureClass).isRequired,
};

module.exports = Feature;
