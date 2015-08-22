import React from "react";
import SansSel from "../sans-sel";
import types from "../types";

@SansSel
export default class SearchInput extends React.Component {

  static propTypes = {
    initialValue: types.string,
    onChange: types.func,
  };

  static styles = {
    root: {
      width: "100%",
      boxSizing: "border-box",
      border: "solid #888",
      borderWidth: "0 0 1px 0",
      padding: "4px 6px",
      font: "inherit",
      color: "inherit",
      outline: "none",
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.initialValue,
    };
  }

  render() {
    return (
      <input
        ss="root"
        ref="root"
        type="text"
        placeholder="Search..."
        value={this.state.value}
        onChange={this.onChange.bind(this)}
        onKeyDown={this.onKeyDown.bind(this)}
      />
    );
  }

  componentDidMount() {
    let node = this.refs.root.getDOMNode();
    node.focus();
    node.selectionStart = node.selectionEnd = node.value.length;
  }

  onKeyDown(e) {
    if (e.key === "Escape") this.setValue("");
  }

  onChange(event) {
    this.setValue(event.target.value);
  }

  setValue(value) {
    if (this.props.onChange) this.props.onChange(value);
    this.setState({ value });
  }

}
