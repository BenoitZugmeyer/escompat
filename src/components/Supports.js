import React from "react";
import Component from "../Component";
import SansSel from "../sans-sel";
import types from "../types";
import warning from "../icons/warning.svg"; // eslint-disable-line import/default
import { getSupportsByProject, getReferenceSupport } from "../supports";


@SansSel
export default class Supports extends Component {

  static propTypes = {
    group: types.group.isRequired,
    supports: types.arrayOf(types.support).isRequired,
  };

  static styles = {
    root: {
      display: "flex",
      flexWrap: "wrap",
    },

    support: {
      position: "relative",
      margin: "2px",
      padding: "3px 6px",
      fontSize: ".8em",
      textAlign: "center",
      color: "#fff",
      borderRadius: "3px",
    },

    pass: {
      backgroundColor: "#27AE60",
    },

    fail: {
      backgroundColor: "#C0392B",
    },

    mixed: {
      backgroundColor: "#E67E22",
    },

    note: {
      display: "inline-block",
      verticalAlign: "top",
      backgroundImage: `url(${warning})`,
      width: "16px",
      height: "16px",
      marginLeft: "5px",
    },

  };

  renderSupport(project, supports) {
    let referenceSupport = getReferenceSupport(supports);
    let cls =
      referenceSupport.pass === true ? "pass" :
      referenceSupport.pass === "mixed" ? "mixed" :
        "fail";

    let title = (referenceSupport.note !== true && referenceSupport.note) || "";

    return (
      <div
        key={project.name}
        ss={[ "support", cls ]}
        title={title}>

        {project.name}
        {" "}
        {referenceSupport.version.number}
        {referenceSupport.note && <span ss="note" />}
      </div>
    );
  }

  render() {
    let supportsByProject = getSupportsByProject(this.props.group.versions, this.props.supports);

    return (
      <div ss="root">
        {supportsByProject.map(
          ({ project, supports }) => this.renderSupport(project, supports)
        )}
      </div>
    );
  }

}
