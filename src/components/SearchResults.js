import React from "react";
import Feature from "./Feature";
import SansSel from "../sans-sel";

@SansSel
export default class SearchResults extends React.Component {

  static propTypes = {
    hasQuery: React.PropTypes.boolean,
    results: React.PropTypes.array.isRequired,
  };

  static styles = {
    message: {
      textAlign: "center",
      fontSize: "1.5em",
      padding: "10px",
      color: "#888",
    },

    upArrow: {
      fontSize: "2em",
      display: "inline-block",
      verticalAlign: "bottom",
      marginLeft: "10px",
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
    if (!this.props.hasQuery) return this.renderMessage(<span>Type a query to begin<span ss="upArrow">⤴</span></span>);
    if (!this.props.results.length) return this.renderMessage("No result");

    let results = this.props.results.slice(0, 20);
    return (
      <div>
        {results.map((result) => <Feature key={result.name} feature={result} />)}
      </div>
    );
  }

}
