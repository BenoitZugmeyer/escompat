import React from "react";
import Component from "../Component";

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

export default class Feature extends Component {

  static propTypes = {
    feature: React.PropTypes.object.isRequired,
  };

  renderSupport(support) {
    let supported = [89, 56, 62];
    let notSupported = [10, 97, 65];

    let style = {
      backgroundColor: mixColors(supported, notSupported, support.score),
    };

    let optionalStyle = {
      backgroundColor: mixColors(supported, notSupported, support.optionalScore),
    };

    return (
      <li key={support.version.id} style={style}>
        {support.version.project.name} {support.version.version}: {percent(support.score)}
        &nbsp;
        {support.score !== support.optionalScore && <span style={optionalStyle}>({percent(support.optionalScore)})</span>}
      </li>
    );
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

  render() {
    let feature = this.props.feature;
    // console.log(feature);
    let groupStyle = {
      color: "#888",
    };
    // let supports = [];
    // let previousSupport;
    // for (let support of feature.supports) {
    //   if (!previousSupport ||
    //       previousSupport.version.project !== support.version.project ||
    //       previousSupport.score !== support.score ||
    //       previousSupport.optionalScore !== support.optionalScore) {
    //     supports.push(support);
    //   }

    //   previousSupport = support;
    // }

        // <ul>
        //   {supports.map((s) => this.renderSupport(s))}
        // </ul>
    return (
      <div>
        <span style={groupStyle}>{feature.group.name}</span> {feature.name}
        {feature.tests.length === 1 ?
          this.renderTest(feature.tests[0]) :
          <ul>
            {feature.tests.map(
              (test, i) => <li key={i}>{this.renderTest(test)}</li>
            )}
          </ul>
        }
      </div>
    );
  }

}
