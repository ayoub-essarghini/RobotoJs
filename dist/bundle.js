/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/Home.ts":
/*!********************************!*\
  !*** ./src/components/Home.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Home: () => (/* binding */ Home)\n/* harmony export */ });\n/* harmony import */ var _utils_vdom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/vdom */ \"./src/utils/vdom.ts\");\n/* harmony import */ var _services_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../services/service */ \"./src/services/service.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\nclass Home {\n    constructor(onDataUpdated) {\n        this.data = [];\n        this.isLoading = true;\n        this.onDataUpdated = onDataUpdated;\n        const httpClient = new _services_service__WEBPACK_IMPORTED_MODULE_1__.HttpClient();\n        this.fetchData(httpClient);\n    }\n    fetchData(httpClient) {\n        return __awaiter(this, void 0, void 0, function* () {\n            try {\n                const res = yield httpClient.get(\"https://jsonplaceholder.typicode.com/posts\");\n                this.data = res;\n                this.isLoading = false;\n                this.onDataUpdated(); // Trigger re-render after data is fetched\n            }\n            catch (err) {\n                console.error(err);\n                this.isLoading = false;\n                this.onDataUpdated(); // Trigger re-render even if there's an error\n            }\n        });\n    }\n    render() {\n        if (this.isLoading) {\n            return (0,_utils_vdom__WEBPACK_IMPORTED_MODULE_0__.createElement)(\"div\", {}, \"Loading...\");\n        }\n        const children = this.data.map(post => this.createPostVNode(post));\n        return (0,_utils_vdom__WEBPACK_IMPORTED_MODULE_0__.createElement)(\"div\", {}, ...children);\n    }\n    createPostVNode(post) {\n        return (0,_utils_vdom__WEBPACK_IMPORTED_MODULE_0__.createElement)(\"div\", {}, (0,_utils_vdom__WEBPACK_IMPORTED_MODULE_0__.createElement)(\"div\", {}, `Title: ${post.title}`), (0,_utils_vdom__WEBPACK_IMPORTED_MODULE_0__.createElement)(\"p\", {}, post.body), (0,_utils_vdom__WEBPACK_IMPORTED_MODULE_0__.createElement)(\"hr\", {}));\n    }\n}\n\n\n//# sourceURL=webpack:///./src/components/Home.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _routes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./routes */ \"./src/routes.ts\");\n/* harmony import */ var _utils_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/router */ \"./src/utils/router.ts\");\n\n\nconst appContainer = document.getElementById(\"app\");\nconst router = new _utils_router__WEBPACK_IMPORTED_MODULE_1__.Router(_routes__WEBPACK_IMPORTED_MODULE_0__.routes, appContainer);\ndocument.addEventListener(\"click\", (e) => {\n    const target = e.target;\n    if (target.tagName === \"A\" && target.getAttribute(\"href\")) {\n        e.preventDefault();\n        router.navigate(target.getAttribute(\"href\"));\n    }\n});\n// Initial render\n// router.route();\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ }),

/***/ "./src/routes.ts":
/*!***********************!*\
  !*** ./src/routes.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   routes: () => (/* binding */ routes)\n/* harmony export */ });\n/* harmony import */ var _components_Home__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/Home */ \"./src/components/Home.ts\");\n\nconst routes = [\n    { path: \"/\", component: _components_Home__WEBPACK_IMPORTED_MODULE_0__.Home },\n];\n\n\n//# sourceURL=webpack:///./src/routes.ts?");

/***/ }),

/***/ "./src/services/service.ts":
/*!*********************************!*\
  !*** ./src/services/service.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   HttpClient: () => (/* binding */ HttpClient)\n/* harmony export */ });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nclass HttpClient {\n    get(endPoint) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const response = yield fetch(endPoint);\n            if (!response.ok)\n                throw new Error(\"Response Failed\");\n            return response.json();\n        });\n    }\n}\n\n\n//# sourceURL=webpack:///./src/services/service.ts?");

/***/ }),

/***/ "./src/utils/router.ts":
/*!*****************************!*\
  !*** ./src/utils/router.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Router: () => (/* binding */ Router)\n/* harmony export */ });\n/* harmony import */ var _utils_vdom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/vdom */ \"./src/utils/vdom.ts\");\n\nclass Router {\n    constructor(routes, appContainer) {\n        this.routes = routes;\n        this.appContainer = appContainer;\n        this.init();\n    }\n    init() {\n        window.addEventListener(\"popstate\", () => this.route());\n        document.addEventListener(\"DOMContentLoaded\", () => this.route());\n    }\n    route() {\n        const path = window.location.pathname;\n        const route = this.routes.find((r) => r.path === path);\n        if (route) {\n            const onDataUpdated = () => {\n                const component = new route.component(onDataUpdated);\n                const vNode = component.render();\n                this.appContainer.innerHTML = ''; // Clear the container\n                this.appContainer.appendChild((0,_utils_vdom__WEBPACK_IMPORTED_MODULE_0__.render)(vNode));\n            };\n            onDataUpdated(); // Initial render\n        }\n        else {\n            this.appContainer.innerHTML = \"<h1>404 - Page Not Found</h1>\";\n        }\n    }\n    navigate(path) {\n        window.history.pushState({}, \"\", path);\n        this.route();\n    }\n}\n\n\n//# sourceURL=webpack:///./src/utils/router.ts?");

/***/ }),

/***/ "./src/utils/vdom.ts":
/*!***************************!*\
  !*** ./src/utils/vdom.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createElement: () => (/* binding */ createElement),\n/* harmony export */   patch: () => (/* binding */ patch),\n/* harmony export */   render: () => (/* binding */ render)\n/* harmony export */ });\nfunction isVNode(node) {\n    return typeof node !== \"string\";\n}\nfunction createElement(tag, props, ...children) {\n    return { tag, props, children };\n}\n//render virtual dom to real dom\nfunction render(vNode) {\n    if (typeof vNode === \"string\") {\n        return document.createTextNode(vNode);\n    }\n    const element = document.createElement(vNode.tag);\n    // Set attributes\n    for (const [key, value] of Object.entries(vNode.props || {})) {\n        element.setAttribute(key, value);\n    }\n    // Render children\n    vNode.children.forEach((child) => {\n        element.appendChild(render(child));\n    });\n    return element;\n}\nfunction patch(parent, newVNode, oldVNode, index = 0) {\n    const existingNode = parent.childNodes[index];\n    if (!existingNode) {\n        parent.appendChild(render(newVNode));\n    }\n    else if (typeof newVNode === \"string\" && typeof oldVNode === \"string\") {\n        if (newVNode !== oldVNode) {\n            existingNode.textContent = newVNode;\n        }\n    }\n    else if (isVNode(newVNode) && isVNode(oldVNode)) {\n        if (newVNode.tag !== oldVNode.tag) {\n            parent.replaceChild(render(newVNode), existingNode);\n        }\n        else {\n            const newVNodeChildren = newVNode.children;\n            const oldVNodeChildren = oldVNode.children;\n            for (let i = 0; i < newVNodeChildren.length || i < oldVNodeChildren.length; i++) {\n                patch(existingNode, newVNodeChildren[i], oldVNodeChildren[i], i);\n            }\n        }\n    }\n}\n\n\n//# sourceURL=webpack:///./src/utils/vdom.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;