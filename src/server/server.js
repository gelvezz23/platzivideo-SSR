const express = require("express");
const dotenv = require("dotenv");
const webpack = require("webpack");
import React from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { renderRoutes } from "react-router-config";
import serverRoutes from "./../frontend/routes/serverRoutes";
import { StaticRouter } from "react-router-dom";
import reducer from "./../frontend/reducers";
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
}

const setResponse = (html) => {
  return `
    <!DOCTYPE html>
      <head>
        <link href="assets/app.css" rel="stylesheet" type="text/css"/>
        <title>Platzi video</title>
      </head>
      <body>
        <div id='app'>${html}</div>  
        <script src="assets/app.js" type="text/javascript"></script>
      </body>
    </html>`;
};

const renderApp = (req, res) => {
  const store = createStore(reducer, initialState);
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes)}
      </StaticRouter>
    </Provider>
  );
  res.send(setResponse(html));
};

app.get("*", renderApp);
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("Runing server on port: " + PORT);
});
