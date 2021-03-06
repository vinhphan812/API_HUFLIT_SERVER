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
			const API = new HUFLIT();
			API.jar.setCookie(req.body.cookie, SERVER);
			res.send(await API.getSchedules("HK02"));
		} catch (error) {
			res.send(error);
		}
	},
	changePass: async (req, res) => {
		const API = new HUFLIT();
		try {
			API.jar.setCookie(req.body.cookie, SERVER);
			res.send(
				await API.ChangePass(req.body.oldPass, req.body.newPass)
			);
		} catch (error) {
			res.send(error);
		}
	},
	getMark: async (req, res) => {
		const term = req.body.term || 0,
			year = req.body.year || 0,
			studyProgram = req.body.studyProgram;
		try {
			if (!studyProgram)
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
	},
};
