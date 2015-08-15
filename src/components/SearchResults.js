import React from "react";
import Feature from "./Feature";

export default class SearchResults extends React.Component {

  static propTypes = {
    results: React.PropTypes.array.isRequired,
  };

  render() {
    let results = this.props.results.slice(0, 20);
    return (
      <div>
        {results.map((result) => <Feature key={result.name} feature={result} />)}
      </div>
    );
  }

}
