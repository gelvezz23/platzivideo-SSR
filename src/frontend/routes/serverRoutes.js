import Home from "../containers/Home";
import Login from "../containers/Login";
import Register from "../containers/Register";
import NotFound from "../containers/NotFound";
import Player from "../containers/Player";

const serverRoutes = [
  {
    exact: true,
    path: "/",
    component: Home,
  },
  {
    exact: true,
    path: "/register",
    component: Register,
  },
  {
    exact: true,
    path: "/login",
    component: Login,
  },
  {
    exact: true,
    path: "/player/:id",
    component: Player,
  },
  {
    name: "NotFound",
    component: NotFound,
  },
];
export default serverRoutes;
