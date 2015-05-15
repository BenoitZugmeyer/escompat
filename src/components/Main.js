let React = require("react");
let { RouteHandler } = require("react-router");

let Component = require("../Component");

class Main extends Component {

  render() {
    return (
      <div>
        <RouteHandler />
      </div>
    );
  }

}

module.exports = Main;
