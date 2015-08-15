import React from "react";
import Component from "../Component";

export default class TestResults extends Component {

  static propTypes = {
    results: React.PropTypes.array.isRequired,
  };

  render() {
    let results = this.props.results;
    let resultStyle = {
      flex: 1,
      backgroundColor: "red",
    };
    let resultPassStyle = Object.assign({}, resultStyle, {
      backgroundColor: "green",
    });
    let style = {
      display: "flex",
    };
    /*eslint-disable react/no-danger*/
    return (
      <div style={style}>
        {results.map((result) => {
          if (result.browser.obsolete) return null;
          let shortName = { __html: result.browser.short };
          return (
            <div
              key={result.browser.short}
              style={result.pass ? resultPassStyle : resultStyle}
              dangerouslySetInnerHTML={shortName}>
            </div>
          );
        })}
      </div>
    );
    /*eslint-enable react/no-danger*/
  }

}
