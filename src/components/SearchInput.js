let React = require("react");

class SearchInput extends React.Component {

  render() {
    let onChange = this.props.onChange && (event => this.props.onChange(event.target.value));

    return <input
        type="text"
        placeholder="Search..."
        defaultValue={this.props.initialValue}
        onChange={onChange}
      />;
  }

}

SearchInput.propTypes = {
  onChange: React.PropTypes.func,
  initialValue: React.PropTypes.string,
};

module.exports = SearchInput;
