import React from "react";

import search from "../search";
import Component from "../Component";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";

export default class Search extends Component {

  static propTypes = {
    params: React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    router: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      searchResults: search(this.props.params.query),
    };
  }

  search(query) {
    this.context.router.replaceWith(query ? "search" : "index", { query });
    this.setState({ searchResults: search(query) });
  }

  render() {
    return (
      <div>
        <SearchInput initialValue={this.props.params.query} onChange={(value) => this.search(value)} />
        <SearchResults results={this.state.searchResults} />
      </div>
    );

  }

}
