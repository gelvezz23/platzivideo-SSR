const express = require("express");
const dotenv = require("dotenv");
const webpack = require("webpack");
import React from "react";
import helmet from "helmet";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { renderRoutes } from "react-router-config";
import serverRoutes from "./../frontend/routes/serverRoutes";
import { StaticRouter } from "react-router-dom";
import reducer from "./../frontend/reducers";
import getManifest from "./getManifest";
import initialState from "./../frontend/initialState";

const app = express();

dotenv.config();
const { ENV, PORT } = process.env;

if (ENV === "development") {
  console.log("Development config");
  const webpackConfig = require("../../webpack.config");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");
  const compiler = webpack(webpackConfig);
  const { publicPath } = webpackConfig.output;
  const serverConfig = { serverSideRender: true, publicPath };

  app.use(webpackDevMiddleware(compiler, serverConfig));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use((req, res, next) => {
    if (!req.hashManifest) req.hashManifest = getManifest();
    next();
  });
  app.use(express.static(`${__dirname}/public`));
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());

  app.disable("x-powered-by");
}

const setResponse = (html, preload, manifest) => {
  const vendorStyles = manifest ? manifest["vendors.css"] : "assets/vendor.css";

  const mainBuild = manifest ? manifest["main.js"] : "assets/app.js";
  const vendorBuild = manifest ? manifest["vendors.js"] : "assets/vendor.js";

  return `
    <!DOCTYPE html>
      <head>
       
        <link href=${vendorStyles} rel="stylesheet" type="text/css"/>

        <title>Platzi video</title>
      </head>
      <body>
        <div id='app'>${html}</div>  
        <script src=${mainBuild} type="text/javascript"></script>
        <script src=${vendorBuild} type="text/javascript"></script>

      </body>
    </html>`;
};

const renderApp = (req, res) => {
  const store = createStore(reducer, initialState);
  const preloadState = store.getState();
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes)}
      </StaticRouter>
    </Provider>
  );
  res.set(
    "Content-Security-Policy",
    "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
  );
  res.send(setResponse(html, preloadState, req.hashManifest));
};

app.get("*", renderApp);
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("Runing server on port: " + PORT);
});
