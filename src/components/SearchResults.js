let React = require("react");
let Feature = require("./Feature");

class SearchResults extends React.Component {

  render() {
    let results = this.props.results.slice(0, 20);
    return <div>
      {results.map(result => <Feature key={result.name} feature={result} />)}
    </div>;
  }

}

SearchResults.propTypes = {
  results: React.PropTypes.array.isRequired,
};

module.exports = SearchResults;
