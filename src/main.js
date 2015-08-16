/*eslint-env browser*/
import React from "react";
import Perf from "react/lib/ReactDefaultPerf";
import Router from "react-router";
let { Route, DefaultRoute } = Router;

import Search from "./components/Search";
import Main from "./components/Main";

let routes = (
  <Route name="index" path="/" handler={Main}>
    <DefaultRoute handler={Search}/>
    <Route name="search" path="search/:query" handler={Search}/>
  </Route>
);

Router.run(routes, (Handler) => {
  React.render(<Handler />, document.body);
});

if (process.env.NODE_ENV !== "production") {
  window.React = React;
  window.Perf = Perf;
}
