import React from "react";

export default class SearchInput extends React.Component {

  static propTypes = {
    initialValue: React.PropTypes.string,
    onChange: React.PropTypes.func,
  };

  render() {
    let onChange = this.props.onChange && ((event) => this.props.onChange(event.target.value));

    return (
      <input
        type="text"
        placeholder="Search..."
        defaultValue={this.props.initialValue}
        onChange={onChange}
      />
    );
  }

}
