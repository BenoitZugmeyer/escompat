let React = require("react");
let Feature = require("./Feature");

class SearchResults extends React.Component {

  render() {
    return <div>
      {this.props.results.map(result => <Feature key={result.name} feature={result} />)}
    </div>;
  }

}

SearchResults.propTypes = {
  results: React.PropTypes.array.isRequired,
};

module.exports = SearchResults;
