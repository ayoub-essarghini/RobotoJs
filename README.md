# RobotoJs

A lightweight TypeScript front-end framework and component-based project focused on building UI features with modular routing, reusable components, and a simple project structure.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6) ![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## Overview

RobotoJs is a custom front-end experimentation project built with TypeScript and designed around a lightweight component architecture. It includes a routing layer, utility modules, services, and styling assets for creating small UI-driven applications without depending on a larger framework.

## Features

- TypeScript-based project structure
- Component-oriented architecture
- Basic routing system
- Service and utility layers for app logic
- CSS styling with Tailwind/PostCSS setup
- Express server included for serving built assets

## Tech Stack

### Frontend
- TypeScript
- Tailwind CSS
- Express

### Tools
- Vite-style build pipeline (via TypeScript compilation and CSS build scripts)
- PostCSS
- npm scripts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/ayoub-essarghini/RobotoJs.git
cd RobotoJs
npm install
```

### Run the project

```bash
npm run dev
```

### Build the project

```bash
npm run build
```

## Project Structure

```text
RobotoJs/
├── dist/
├── public/
├── src/
│   ├── components/
│   ├── core/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── main.ts
│   ├── routes.ts
│   └── ...
├── LICENSE
├── package.json
├── postcss.config.js
├── server.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## What I learned

- How to design a small component-driven front-end architecture in TypeScript
- How to structure utility and service layers for modular app development
- How to manage build scripts and styling pipeline in a lightweight framework project
- How to keep a custom UI system lean and understandable for experimentation

## Future improvements

- Add a more explicit component lifecycle model
- Improve documentation of routing and state flow
- Add testing for core utility and rendering logic
- Expand the framework toward a more complete app architecture

## License

This project is licensed under the MIT License.
