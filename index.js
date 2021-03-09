const express = require("express"),
	cors = require("cors");

const ctrlAPI = require("./Controller/api.controller");

const app = express(),
	port = process.env.PORT || 3000;

const listAPI = require("./static/listAPI");

app.set("view engine", "pug");
app.set("views", "static");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));

app.get("/", (req, res) => res.render("HOME", { list: listAPI }));

app.post("/Login", ctrlAPI.loginAPI);

app.post("/CheckCookie", ctrlAPI.checkCookie);

app.post("/GetSchedule", ctrlAPI.middlewareCheckCookie, ctrlAPI.getSchedule);

app.post("/ChangePass", ctrlAPI.middlewareCheckCookie, ctrlAPI.changePass);

app.post("/GetMark", ctrlAPI.middlewareCheckCookie, ctrlAPI.getMark);

app.listen(port, () => console.log("Server is running..."));
