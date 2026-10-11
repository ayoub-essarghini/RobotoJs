<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,50:164E63,100:06B6D4&height=220&section=header&text=RobotoJs&fontSize=64&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38&desc=Inside%20the%20frontend%20framework.&descSize=18&descAlignY=63" alt="RobotoJs — Inside the frontend framework" />

### Components, state, and rendering. Built in TypeScript.

An experimental frontend framework exploring how component-based interfaces work underneath the abstractions.

<br />

<img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.7" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3.4" />
<img src="https://img.shields.io/badge/Express-4-0F172A?style=for-the-badge&logo=express&logoColor=white" alt="Express 4" />
<img src="https://img.shields.io/badge/Status-Experimental-164E63?style=for-the-badge" alt="Experimental" />

<br /><br />

[Overview](#overview) · [Features](#features) · [Component Example](#component-example) · [Getting Started](#getting-started) · [Architecture](#architecture)

</div>

<br />

## Overview

RobotoJs is a custom frontend framework written in TypeScript.

It explores the mechanisms behind component-based interfaces: representing UI as virtual nodes, tracking state across renders, scheduling updates, managing effects, and routing between views.

The repository includes a framework implementation, example components, a client-side router, and an Express server for serving the application.

The goal is to understand framework internals by implementing them directly.

<br />

## Features

| Area | Implementation |
| :--- | :--- |
| **Components** | Function components represented through virtual nodes |
| **JSX support** | TypeScript JSX compilation using the custom `h` factory |
| **State** | `useState` with direct and functional updates |
| **Effects** | Dependency tracking and cleanup functions |
| **Memoization** | `useMemo` and `useCallback` implementations |
| **References** | `useRef` for persistent references |
| **Context** | Provider and consumer mechanisms |
| **Rendering** | Virtual node rendering and DOM update logic |
| **Events** | DOM event registration and cleanup |
| **Routing** | History API navigation and browser back/forward handling |
| **Styling** | Tailwind CSS and PostCSS |
| **Serving** | Express static hosting with an SPA fallback |

These are experimental implementations and do not imply full compatibility with React.

<br />

## Component Example

The repository includes a counter demonstrating state and effect cleanup:

```tsx
import { h, useState, useEffect } from "../core/roboto.js";

export const Counter = (props: any) => {
  const [count, setCount] = useState(props.count || 0);

  useEffect(() => {
    console.log("Count changed:", count);

    return () => {
      console.log("Cleanup:", count);
    };
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>

      <button onClick={() => setCount(count - 1)}>
        -
      </button>

      <button onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
};
```

The imports come from RobotoJs itself. JSX is compiled into calls to its `h` function.

<br />

## Core Concepts

### Virtual nodes

UI elements are represented as objects containing their type, props, children, and optional key.

```typescript
h("button", { onClick: handleClick }, "Click me");
```

This representation lets the framework work with a UI tree before creating or updating browser elements.

### Component state

Each component instance stores its state and tracks hook calls through a cursor.

The state setter supports both forms:

```typescript
setCount(5);

setCount(previous => previous + 1);
```

State changes use `Object.is` comparison before requesting another render.

### Effects and cleanup

Effects compare dependency values and schedule callbacks after rendering. Cleanup functions are stored and invoked when the effect changes or the component unmounts.

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    console.log("tick");
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

### Routing

The router uses:

- `window.location.pathname` for route matching.
- `history.pushState` for navigation.
- `popstate` for browser back and forward.
- Component unmounting when changing views.
- A `/*` fallback route or a default 404 view.

<br />

## Getting Started

### Prerequisites

- Node.js and npm.
- A modern browser.
- A shell supporting `mkdir -p` for the current build script.

### 1. Clone and install

```bash
git clone https://github.com/ayoub-essarghini/RobotoJs.git
cd RobotoJs
npm install
```

### 2. Build the application

```bash
npm run build
```

This compiles TypeScript into `dist/` and builds the CSS.

### 3. Start the server

```bash
node server.js
```

Open **http://localhost:8080**.

### 4. Watch for changes

In a separate terminal:

```bash
npm run dev
```

This watches TypeScript and CSS. It does not start the Express server or provide browser hot reload.

Refresh the browser after changes have compiled.

<br />

## Available Commands

| Command | Purpose |
| :--- | :--- |
| `npm run build` | Compile TypeScript and build CSS |
| `npm run build:css` | Generate CSS with PostCSS |
| `npm run watch:css` | Rebuild CSS when source files change |
| `npm run dev` | Run TypeScript and CSS watchers concurrently |
| `node server.js` | Serve the application on port `8080` by default |

The server reads `PORT` from the environment when provided.

<br />

## Architecture

| Component | Responsibility |
| :--- | :--- |
| **JSX factory** | Convert JSX into virtual node objects |
| **Component instance** | Store state, effect dependencies, references, and render state |
| **Rendering logic** | Create and update DOM elements |
| **Event handling** | Register and remove DOM listeners |
| **Context registry** | Associate context values with component instances |
| **Router** | Match paths and mount the selected view |
| **Express server** | Serve compiled files and handle SPA requests |

### State update flow

| Step | Action |
| :---: | :--- |
| **01** | A user interaction calls a state setter |
| **02** | The component instance compares the previous and next values |
| **03** | A changed value requests a render |
| **04** | The component produces its updated virtual tree |
| **05** | Rendering logic updates the browser DOM |
| **06** | Scheduled effects run and previous cleanups are handled |

<br />

## Project Structure

| Path | Contents |
| :--- | :--- |
| `src/core/roboto.ts` | Framework core, component instances, hooks, and context |
| `src/core/jsx.d.ts` | JSX type declarations |
| `src/components/` | Example components, including Counter and TodoApp |
| `src/utils/router.ts` | Client-side router |
| `src/utils/vdom.ts` | Additional virtual DOM rendering and patch utilities |
| `src/services/` | Application service and API modules |
| `src/styles/main.css` | CSS entry point |
| `src/main.ts` | Application initialization |
| `src/routes.ts` | Route definitions |
| `public/index.html` | HTML entry point |
| `dist/` | Compiled JavaScript and CSS |
| `server.js` | Express server |
| `tsconfig.json` | TypeScript and JSX configuration |
| `tailwind.config.js` | Tailwind configuration |
| `postcss.config.js` | PostCSS configuration |

<br />

## Build Configuration

The project uses TypeScript compilation and PostCSS scripts.

| Setting | Value |
| :--- | :--- |
| TypeScript target | `es2019` |
| Module output | `es2020` |
| Source directory | `src/` |
| Output directory | `dist/` |
| JSX factory | `h` |
| JSX fragment factory | `Fragment` |
| TypeScript strict mode | Enabled |

The build pipeline does not use Vite.

<br />

## Engineering Focus

- Representing UI with virtual nodes.
- Preserving state between component renders.
- Implementing hook dependency tracking.
- Managing effect and event listener cleanup.
- Connecting navigation to component mounting.
- Building a frontend toolchain with TypeScript and PostCSS.

<br />

## Current Scope

RobotoJs is an educational framework experiment.

- Hook and rendering behavior should be tested before relying on complex component patterns.
- Routing currently matches exact paths and a wildcard fallback.
- Development scripts watch compilation but do not provide hot module replacement.
- The Express server also serves the repository directory; its static file scope should be narrowed before deployment.
- No automated test script is currently configured.

<br />

## Possible Improvements

- Automated tests for state, effects, and DOM updates.
- Stronger types for component props and event handlers.
- Edge-case coverage for reconciliation and cleanup.
- Dynamic route parameters and nested routes.
- Browser reload support during development.
- Clearer separation between framework code and demo applications.
- A narrower static asset configuration for deployment.

<br />

## License

Licensed under the [MIT License](LICENSE).

<br />

---

<div align="center">

**Built by [Ayoub Es Sarghini](https://github.com/ayoub-essarghini)**

[Portfolio](https://www.ayoub-essarghini.com/) · [LinkedIn](https://www.linkedin.com/in/ayoub-es-sarghini-839973212)

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,50:164E63,100:06B6D4&height=100&section=footer" alt="" />

</div>
