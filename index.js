const express = require("express"),
	cors = require("cors"),
	path = require("path");

const {
	loginAPI,
	checkCookie,
	middlewareCheckCookie,
	getSchedule,
	changePass,
	getMark,
	surveyTeacher,
} = require("./Controller/api.controller");

const app = express(),
	port = process.env.PORT || 3000;

const listAPI = require("./static/listAPI");

app.set("view engine", "pug");
app.set("views", "static");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "static")));

app.get("/", (req, res) => res.render("HOME", { list: listAPI }));

app.post("/Login", loginAPI);

app.post("/CheckCookie", checkCookie);

app.post("/GetSchedule", middlewareCheckCookie, getSchedule);

app.post("/ChangePass", middlewareCheckCookie, changePass);

app.post("/GetMark", middlewareCheckCookie, getMark);

app.post("/SurveyTeacher", middlewareCheckCookie, surveyTeacher);

app.listen(port, () => console.log("Server is running..."));
