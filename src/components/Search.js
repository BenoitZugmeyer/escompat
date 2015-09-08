import React from "react";

import search from "../search";
import Component from "../Component";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import ProjectSelector from "./ProjectSelector";
import types from "../types";
import { projects } from "../data";

const getProjectSmallId = (p) => {
  let name;
  for (const s of p.short) {
    if (!name || s.length < name.length) name = s;
  }
  if (!name || p.name.length < name.length) name = p.name;
  return name.toLowerCase();
};

export default class Search extends Component {

  static propTypes = {
    params: types.shape({
      query: types.string,
      projects: types.string,
    }).isRequired,
  };

  static contextTypes = {
    router: types.func,
  };

  constructor(props) {
    super(props);
    let query = this.props.params.query;
    let selectedProjects;

    if (this.props.params.projects) {
      let projectIds = new Set(this.props.params.projects.split(","));
      selectedProjects = new Set([
        for (project of projects) if (projectIds.has(getProjectSmallId(project))) project
      ]);
    }
    else {
      selectedProjects = new Set([
        for (project of projects) if (project.type === "browser") project
      ]);
    }

    this.state = {
      query,
      searchResults: search(query),
      selectedProjects,
    };
  }

  search(query) {
    this.setState({
      query,
      searchResults: search(query),
    });
  }

  selectProjects(selectedProjects) {
    this.setState({ selectedProjects });
  }

  componentWillUpdate(props, state) {
    const projects = [for (p of state.selectedProjects) getProjectSmallId(p)].join(",");
    this.context.router.replaceWith("search", {
      query: state.query,
      projects,
    });
  }

  render() {
    let query = this.state.query;
    return (
      <div>
        <SearchInput initialValue={query} onChange={::this.search} />
        <ProjectSelector
          initialSelectedProjects={this.state.selectedProjects}
          onChange={::this.selectProjects} />
        <SearchResults results={this.state.searchResults} hasQuery={Boolean(query)} projects={this.state.selectedProjects} />
      </div>
    );

  }

}
