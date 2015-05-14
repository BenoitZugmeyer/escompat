let React = require("react");

function fastShallowCompare(a, b) {
  for (let key in a) {
    if (a[key] !== b[key]) return false;
  }

  for (let key in b) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

class Component extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !fastShallowCompare(this.props, nextProps) ||
      !fastShallowCompare(this.state, nextState)
    );
  }
}

module.exports = Component;
