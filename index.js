const express = require("express"),
	path = require("path"),
	cors = require("cors");

const controlAPI = require("./Controller/api.controller");

const app = express(),
	port = 3000;

const listAPI = require("./static/listAPI");

app.set("view engine", "pug");
app.set("views", "static");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", cors(), function (req, res) {
	res.render("HOME", { list: listAPI });
});

app.post("/Login", controlAPI.loginAPI);

app.post(
	"/CheckCookie",
	controlAPI.middlewareCheckCookie,
	controlAPI.checkCookie
);

app.post(
	"/GetSchedule",
	controlAPI.middlewareCheckCookie,
	controlAPI.getSchedule
);

app.post(
	"/ChangePass",
	controlAPI.middlewareCheckCookie,
	controlAPI.changePass
);

app.post("/GetMark", controlAPI.middlewareCheckCookie, controlAPI.getMark);

app.listen(process.env.PORT || port, () => console.log("Server is running..."));
