const HUFLIT = require("../modules/Huflit"),
	SERVER = "https://portal.huflit.edu.vn/";

module.exports = {
	loginAPI: async (req, res) => {
		const API = new HUFLIT();
		try {
			res.send(await API.login(req.body));
		} catch (error) {
			res.send(error);
		}
	},
	checkCookie: async (req, res) => {
		const API = new HUFLIT();
		var response = { success: false, msg: "cookie null" };
		try {
			if (req.body.cookie) {
				API.jar.setCookie(req.body.cookie, SERVER);
				response = await API.CheckCookie();
			}
			res.send(response);
		} catch (error) {
			console.log(error);
			res.send(error);
		}
	},
	getSchedule: async (req, res) => {
		try {
			res.send(await req.API.getSchedules("HK02"));
		} catch (error) {
			res.send(error);
		}
	},
	changePass: async (req, res) => {
		try {
			res.send(
				await req.API.ChangePass(req.body.oldPass, req.body.newPass)
			);
		} catch (error) {
			res.send(error);
		}
	},
	getMark: async (req, res) => {
		const term = req.body.term || 0,
			year = req.body.year || 0,
			studyProgram = req.body.studyProgram || "";
		try {
			res.send(await req.API.getMark(studyProgram, year, term));
		} catch (error) {
			res.send(error);
		}
	},
	surveyTeacher: async (req, res) => {
		const data = req.body;
		var form = {
			SID: data.SID || "",
			PID: data.PID || "",
			classId: data.ClassId,
			auth: data.Auth || "",
			YearStudy: data.YearStudy || "",
			TermID: data.TermID || "",
		};
		console.log(
			!form.SID &&
				!form.PID &&
				!form.auth &&
				!form.YearStudy &&
				!form.TermID
		);
		if (
			!data.SID &&
			!data.PID &&
			!data.auth &&
			!data.YearStudy &&
			!data.TermID
		)
			return res.send({ success: false, dataFail: form });
		res.send(await req.API.Survey(form, 3));
	},
	middlewareCheckCookie: async (req, res, next) => {
		req.API = new HUFLIT();
		try {
			if (!req.body.cookie)
				return res.send({ msg: "cookie null", success: false });
			req.API.jar.setCookie(req.body.cookie, SERVER);
			response = await req.API.CheckCookie();
			if (!response.success) return res.send(response);
			next();
		} catch (error) {
			console.log(error);
			res.send(error);
		}
	},
};
