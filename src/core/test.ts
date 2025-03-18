/** @jsx h */

export function h(type:HTMLElement, props:any, ...children : any) {
    return { type, props: props || {}, children };
  }
  
  function setBooleanProp($target:any, name:any, value:any) {
    if (value) {
      $target.setAttribute(name, value);
      $target[name] = true;
    } else {
      $target[name] = false;
    }
  }
  
  function isCustomProp(name:any) {
    return false;
  }
  
  function setProp($target:any, name:any, value:any) {
    if (isCustomProp(name)) {
      return;
    } else if (name === 'className') {
      $target.setAttribute('class', value);
    } else if (typeof value === 'boolean') {
      setBooleanProp($target, name, value);
    } else {
      $target.setAttribute(name, value);
    }
  }
  
  function setProps($target:any, props:any) {
    Object.keys(props).forEach(name => {
      setProp($target, name, props[name]);
    });
  }
  
  function createElement(node:any) {
    if (typeof node === 'string') {
      return document.createTextNode(node);
    }
    const $el = document.createElement(node.type);
    setProps($el, node.props);
    node.children
      .map(createElement)
      .forEach($el.appendChild.bind($el));
    return $el;
  }
  