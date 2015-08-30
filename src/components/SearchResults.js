import React from "react";
import Feature from "./Feature";
import SansSel from "../sans-sel";
import types from "../types";
import upArrow from "../icons/upArrow.svg";

@SansSel
export default class SearchResults extends React.Component {

  static propTypes = {
    hasQuery: types.bool.isRequired,
    projects: types.setOf(types.project).isRequired,
    results: types.arrayOf(types.feature).isRequired,
  };

  static styles = {

    message: {
      textAlign: "center",
      fontSize: "1.5em",
      padding: "10px",
      color: "#888",
      marginTop: "30px",
    },

    upArrow: {
      display: "inline-block",
      verticalAlign: "top",
      marginLeft: "10px",
      position: "relative",
      top: "-13px",
      backgroundImage: `url(${upArrow})`,
      height: "30px",
      width: "30px",
    },

  };

  renderMessage(message) {
    return (
      <div ss="message">
        {message}
      </div>
    );
  }

  render() {
    if (!this.props.hasQuery) return this.renderMessage(<span>Type a query to begin<span ss="upArrow" /></span>);
    if (!this.props.results.length) return this.renderMessage("No result");

    let results = this.props.results.slice(0, 20);
    return (
      <div>
        {results.map((result) => <Feature key={result.name} feature={result} projects={this.props.projects} />)}
      </div>
    );
  }

}
