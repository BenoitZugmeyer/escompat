import React from "react";

import search from "../search";
import Component from "../Component";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import ProjectSelector from "./ProjectSelector";
import types from "../types";
import { projects } from "../data";

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
      selectedProjects: new Set([for (project of projects) if (project.type === "browser") project]),
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
        <ProjectSelector
          initialSelectedProjects={this.state.selectedProjects}
          onChange={(selectedProjects) => this.setState({ selectedProjects })} />
        <SearchResults results={this.state.searchResults} hasQuery={Boolean(query)} projects={this.state.selectedProjects} />
      </div>
    );

  }

}
