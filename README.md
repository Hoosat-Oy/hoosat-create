# Hoosat Create

Hoosat create is a `npx` script that creates React 18.2 full-stack server side rendering ESM project for you, where you can use Typescript to build web applications. It uses [@Hoosat-Oy/hoosat-template](https://github.com/Hoosat-Oy/hoosat-template) to build React project with SSR and Typescript. 

## Command to run

```
npx hoosat-create@latest
```

## Technologies Used

- React-helmet-async 1.3
- React 18.2
- TypeScript 4.9.2
- Webpack 5
- Jest 27

## Features

- Full-stack TypeScript application using React and Node HTTP/HTTPS.
- Includes working server side SEO with `react-helmet-async`
- Supports ES modules for server-side and client-side ```.
- Configured with Webpack for production builds.
- Includes Jest for unit testing.
- Includes example components and routes for getting started.
- Includes HoosatUI as optional dependancy as git submodule.

## Scripts

- `npm run dev`: Builds and runs the development version.
  - This script concurrently executes the following commands:
    - `npm run dev:build:client`: Builds the client in development mode and watches for file changes.
    - `npm run dev:build:server`: Builds the server in development mode and watches for file changes.
    - `npm run dev:run`: Starts the server with Nodemon to automatically restart it on file changes.

- `npm run build`: Builds the production version.
  - This script sequentially executes the following commands:
    - `npm run build:client`: Builds the client in production mode.
    - `npm run build:server`: Builds the server in production mode.

- `npm run start`: Runs the production version.
  - This script starts the server using the compiled production files.

- `npm run test`: Runs test units with Jest.
  - This script executes the test units using Jest.

## File structure

- `src/client`: Contains client-side ``` (React components, styles, etc.).
- `src/server`: Contains server-side ``` (Node HTTP/HTTPS routes, API routes, etc.).
- `src/common`: Contains common ```.
- `public`: Contains the bundle.js client ``` and public files for the project.
- `dist`: Contains production build output of server.

## Node HTTP/HTTP server with server side router.

`src/server/core/server.ts` contains the source ```, it supports middlewares, wildcard routes and specific routes. There are middlewares currently for setting cors and static files. 

### Basic example

```
import { createRouter, createServer, listen } from './core/server';
import { cors } from './core/cors';
import { assets } from './core/assets';
// Creating the router
const router = createRouter();

// Adding static file middleware
router.Middleware(assets("./public"));

// Creating a ping route
// For request and response we dont use wrappers for node http types and methods.
router.Get("/ping", (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(20, { 'Content-Type': "text/plain" });
  res.end("pong!");
});

// Now that the middleware and routes have been set the server must be created that handles the routes.
const server = createServer(router);

// Start listening on port 3000
const port = parseInt(process.env.PORT || "8080");
listen(server, port, () => {
  console.log(`Server is running on port ${port.toString()}`);
});
```


## License
This template is licensed under the MIT License. Feel free to use it for your own projects or as a starting point for your own templates.

## Message

I just dropped some dependancies from the repository and this will keep happening. With our own ``` we can keep it up to date with React and Node versions more easily. 
Though for now the only goal seems to be to drop `react-helmet-async`. 

## Release changes

### 1.4.0 -> 1.4.1
- Changed createServer to include options argument for changing server protocol and to include SSL certificate information.
- JSDoc has been added and more documentation work.

### 1.3.5 -> 1.4.0
- Dropped Express.js and Babel from dependancies.
- Updated package.json scripts to use concurrently and nodemon.

## Join us
[https://discord.gg/UXPFcPaPBg](Discord)
