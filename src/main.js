
let React = require("react");
let Data = require("./Data");

let data = new Data([
  require("./data/data-es5"),
  require("./data/data-es6"),
  require("./data/data-es7"),
  require("./data/data-esintl"),
  require("./data/data-non-standard"),
]);


let Main = require("./components/Main");


React.render(<Main data={data} />, document.body);
