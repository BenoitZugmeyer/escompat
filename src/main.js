/*eslint-env browser*/
import React from "react";
import Perf from "react/lib/ReactDefaultPerf";
import Router from "react-router";
let { Route, DefaultRoute } = Router;

import Search from "./components/Search";
import Main from "./components/Main";
import SansSel from "./sans-sel";

let routes = (
  <Route name="index" path="/" handler={Main}>
    <DefaultRoute handler={Search}/>
    <Route name="search" path="/:projects?/:query?" handler={Search}/>
  </Route>
);

Router.run(routes, (Handler) => {
  React.render(<Handler />, document.body);
});

SansSel.root.add("body", {
  fontFamily: '"Helvetica Neue",Helvetica,"Segoe UI",Arial,freesans,sans-serif',
  color: "#333",
  margin: "10px",
});

document.body.className = SansSel.root.render("body");


if (process.env.NODE_ENV !== "production") {
  window.React = React;
  window.Perf = Perf;
}
