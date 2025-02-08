import  parseHtml  from './utils/vdom';
let vdom = parseHtml(
/* html */ `
    <h1 style="color:green">Hello</h1>
    <p>This is a page</p>
    <p>some more text</p>
    `);
console.log(vdom);
