import React from "react";

import search from "../search";
import Component from "../Component";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import types from "../types";

export default class Search extends Component {

  static propTypes = {
    params: types.shape({
      query: types.string,
    }).isRequired,
  };

  static contextTypes = {
    router: types.func,
  };

  constructor(props) {
    super(props);
    let query = this.props.params.query;
    this.state = {
      query,
      searchResults: search(query),
    };
  }

  search(query) {
    this.context.router.replaceWith(query ? "search" : "index", { query });
    this.setState({
      query,
      searchResults: search(query),
    });
  }

  render() {
    let query = this.state.query;
    return (
      <div>
        <SearchInput initialValue={query} onChange={(value) => this.search(value)} />
        <SearchResults results={this.state.searchResults} hasQuery={Boolean(query)} />
      </div>
    );

  }

}
