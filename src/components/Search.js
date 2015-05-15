let React = require("react");
let { Navigation } = require("react-router");

let data = require("../data");
let Component = require("../Component");
let SearchInput = require("./SearchInput");
let SearchResults = require("./SearchResults");

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchResults: data.search(this.props.params.query),
    };
  }

  render() {
    return (
      <div>
        <SearchInput initialValue={this.props.params.query} onChange={value => this.search(value)} />
        <SearchResults results={this.state.searchResults} />
      </div>
    );

  }

  search(query) {
    this.replaceWith("search", { query });
    this.setState({ searchResults: data.search(query) });
  }

}


Search.propTypes = {
  params: React.PropTypes.object.isRequired,
};

module.exports = Search;
