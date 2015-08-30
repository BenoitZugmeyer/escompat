import React from "react";
import SansSel from "../sans-sel";
import { projects } from "../data";
import { some, groupBy, collect, apply } from "../itertools";
import openIcon from "../icons/open.svg";
import closeIcon from "../icons/close.svg";
import types from "../types";

@SansSel
export default class ProjectSelector extends React.Component {

  static propTypes = {
    onChange: types.func,
  };

  static styles = {
    root: {
      display: "flex",
      borderBottom: "1px solid #888",
      padding: "10px 5px",
    },

    type: {
      flex: "1",

      padding: "0 5px",
    },

    typeName: {
      fontWeight: "bold",
    },

    project: {
      marginLeft: "10px",
    },

    projects: {
    },

    projectName: {
    },

    toggle: {
      width: "18px",
      height: "18px",
      border: "none",
      backgroundColor: "transparent",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      outline: "none",
      focus: {
        backgroundColor: "#eee",
      },
    },

    toggleOpen: {
      inherit: "toggle",
      backgroundImage: `url(${closeIcon})`,
    },

    toggleClose: {
      inherit: "toggle",
      backgroundImage: `url(${openIcon})`,
    },

    label: {
      display: "flex",
      userSelect: "none",
    },
  };

  static defaultProps = {
    onChange() {},
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedProjects: props.initialSelectedProjects,
      open: false,
    };
  }

  getProjectsByType() {
    return projects::groupBy((project) => project.type);
  }

  changeSelectedProjects(fn) {
    this.setState(
      (state) => {
        let selectedProjects = new Set(state.selectedProjects);
        fn(selectedProjects);
        return { selectedProjects };
      },
      () => this.props.onChange(this.state.selectedProjects)
    );
  }

  renderProject(project) {
    let checked = this.state.selectedProjects.has(project);
    let onChange = () => this.changeSelectedProjects((set) => set[checked ? "delete" : "add"](project));

    return (
      <div ss="project">
        <label ss="label">
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span>{project.name}</span>
        </label>
      </div>
    );
  }

  renderProjects(projects) {
    return <div ss="projects">{projects.map(::this.renderProject)}</div>;
  }

  renderType(name, projects) {
    projects = projects::collect();
    let checked = projects::some(::this.state.selectedProjects.has);
    let onChange = () => this.changeSelectedProjects((set) => {
      for (let project of projects) {
        if (checked) set.delete(project);
        else set.add(project);
      }
    });

    return (
      <div ss="type" key={name}>
        <div ss="typeName">
          <label ss="label">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span>{name}</span>
          </label>
        </div>
        {this.state.open && this.renderProjects(projects)}
      </div>
    );
  }

  render() {
    let toggle = () => this.setState((state) => ({ open: !state.open }));

    return (
      <div ss="root">
        {this.getProjectsByType()
          ::apply(::this.renderType)
          ::collect()}
        <div>
          {this.state.open
            ? <button type="button" onClick={toggle} ss="toggleOpen" title="Close" />
            : <button type="button" onClick={toggle} ss="toggleClose" title="More filters" />}
        </div>
      </div>
    );
  }

}
