const express = require("express"),
	path = require("path"),
	cors = require("cors");

const controlAPI = require("./Controller/api.controller");

const app = express(),
	port = 3000;

app.set("view engine", "pug");
app.set("views", "static");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", cors(), function (req, res) {
	res.render("index");
});

app.post("/login", controlAPI.loginAPI);

app.post("/CheckCookie", controlAPI.checkCookie);

app.post("/Schedules", controlAPI.getSchedule);

app.post("/ChangePass", controlAPI.changePass);

app.post("/getMark", controlAPI.getMark);

app.listen(process.env.PORT || port, () => console.log("Server is running..."));
