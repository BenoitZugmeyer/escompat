let React = require("react");

let Data = require("../Data");
let SearchInput = require("./SearchInput");
let SearchResults = require("./SearchResults");

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchResults: props.data.all,
    };
  }

  render() {
    return (
      <div>
        <SearchInput onChange={value => this.search(value)} />
        <SearchResults results={this.state.searchResults} />
      </div>
    );

  }

  search(query) {
    this.setState({ searchResults: this.props.data.search(query) });
  }

}

Main.propTypes = {
  data: React.PropTypes.instanceOf(Data).isRequired,
};

module.exports = Main;
