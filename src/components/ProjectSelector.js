import React from "react";
import SansSel from "../sans-sel";
import { projects } from "../data";

@SansSel
export default class ProjectSelector extends React.Component {

  static propTypes = {
  };

  static styles = {
    type: {
    },

    typeName: {
      fontWeight: "bold",
    },

    project: {
      marginLeft: "10px",
    },

    projectName: {
    },
  };

  getProjectsByType() {
    let map = new Map();
    for (let projectId in projects) {
      let project = projects[projectId];
      let currentList = map.get(project.type);
      if (currentList) currentList.push(project);
      else map.set(project.type, [ project ]);
    }
    return [for (entry of map.entries()) entry];
  }

  renderProject(project) {
    return (
      <div ss="project">
        <input type="checkbox" />
        {project.name}
      </div>
    );
  }

  renderProjects(projects) {
    return <div>{projects.map((project) => this.renderProject(project))}</div>;
  }

  renderType(name, projects) {
    return (
      <div ss="type">
        <div ss="typeName">
          <label><input type="checkbox" /> {name}</label>
        </div>
        {this.renderProjects(projects)}
      </div>
    );
  }

  render() {
    return (
      <div>
      {this.getProjectsByType().map(([ type, projects ]) => this.renderType(type, projects))}
      </div>
    );
  }

}
