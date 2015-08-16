import sansSel from "sans-sel";
import React from "react";
import { isValidElement } from "react/lib/ReactElement";

const names = new Map();

function initComponentNamespace(Component) {
  let name;
  if (names.has(Component.name)) {
    let id = names.get(Component.name) + 1;
    names.set(Component.name, id);
    name = `${Component.name}_${id}`;
  }
  else {
    names.set(Component.name, 0);
    name = Component.name;
  }

  let parent = Object.getPrototypeOf(Component)._sansSelNS || rootNS;
  let ss = Component._sansSelNS = parent.namespace(name);

  if (Component.styles) {
    ss.addAll(Component.styles);
  }
}

function overrideComponentRender(Component) {
  let descriptor = Object.getOwnPropertyDescriptor(Component.prototype, "render");
  if (!descriptor.value) throw new Error("Unhandled 'render' method type");

  let originalRender = descriptor.value;

  descriptor.value = function () {
    let result = originalRender.call(this);
    applyStyleOnReactElement(this, result);
    return result;
  };

  Object.defineProperty(Component.prototype, "render", descriptor);
}

function iterElements(component, fn) {
  if (isValidElement(component) && typeof component.type === "string") {
    fn(component);
  }
  if (component && component.props && component.props.children) {
    React.Children.forEach(component.props.children, (child) => iterElements(child, fn));
  }
}

function applyStyleOnReactElement(instance, component) {
  iterElements(component, (element) => {
    let ss = element.props && element.props.ss;
    if (ss) {
      let className = instance.constructor._sansSelNS.render(ss);

      // In development mode, React store the props in _store
      if (element._store) {
        // Setting originalProps prevent React to display a warning
        element._store.originalProps.className = element._store.props.className = className;
      }
      else {
        element.props.className = className;
      }
    }
  });
}


export default function sansSelDecorator(Component) {
  initComponentNamespace(Component);
  overrideComponentRender(Component);
  return Component;
}

sansSelDecorator.root = rootNS;
