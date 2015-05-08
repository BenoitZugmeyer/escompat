let React = require("react");

class TestResults extends React.Component {

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
    return <div style={style}>
      {results.map(result => {
        if (result.browser.obsolete) return null;
        let shortName = { __html: result.browser.short };
        return <div
          key={result.browser.short}
          style={result.pass ? resultPassStyle : resultStyle}
          dangerouslySetInnerHTML={shortName}>
        </div>;
      })}
      </div>;
  }

}

TestResults.propTypes = {
  results: React.PropTypes.array.isRequired,
};

module.exports = TestResults;
