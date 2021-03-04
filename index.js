const HUFLIT = require("./modules/Huflit"),
	bodyParser = require("body-parser"),
	express = require("express"),
	path = require("path"),
	cors = require("cors");

const app = express(),
	port = 3000,
	SERVER = "https://portal.huflit.edu.vn/";

app.set("view engine", "pug");
app.set("views", "static");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", cors(), function (req, res) {
	res.render("index");
});

app.post("/login", cors(), async (req, res, next) => {
	const API = new HUFLIT();
	console.log(req.body);
	API.login(req.body)
		.then((result) => res.json(result))
		.catch((error) => res.send(error));
});

app.post("/CheckCookie", cors(), async (req, res, next) => {
	try {
		const API = new HUFLIT();
		var response = { success: false, msg: "cookie null" };
		if (req.body.cookie) {
			API.jar.setCookie(req.body.cookie, SERVER);
			response = await API.CheckCookie();
		}
		res.send(response);
	} catch (error) {
		res.send(error);
	}
});

app.post("/Schedules", cors(), async (req, res, next) => {
	try {
		const API = new HUFLIT();
		API.jar.setCookie(req.body.cookie, SERVER);
		res.send(await API.getSchedules("HK02"));
	} catch (error) {
		res.send(error);
	}
});

app.post("/ChangePass", cors(), async (req, res, next) => {
	try {
		const API = new HUFLIT();
		API.jar.setCookie(req.body.cookie, SERVER);
		res.send(await API.ChangePass(req.body.oldPass, req.body.newPass));
	} catch (error) {
		res.send(error);
	}
});

app.post("/getMark", cors(), async (req, res, next) => {
	try {
		const term = req.body.term || 0,
			year = req.body.year || 0,
			studyProgram = req.body.studyProgram;

		if (studyProgram.length < 4)
			return res.send({
				success: false,
				message: "Not StudyProgram...!",
			});

		const API = new HUFLIT();
		API.jar.setCookie(req.body.cookie, SERVER);
		res.send(await API.getMark(studyProgram, year, term));
	} catch (error) {
		res.send(error);
	}
});

app.listen(process.env.PORT || port, () => console.log("Server is running..."));
