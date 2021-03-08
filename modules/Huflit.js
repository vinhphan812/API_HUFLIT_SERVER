var request = require("request-promise");
var cheerio = require("cheerio");

const API_SERVER = "https://portal.huflit.edu.vn";

function makeURL(uri, params = {}) {
	var paramStr = [];
	for (var key in params) {
		paramStr.push(`${key}=${params[key]}`);
	}
	return `${uri}?${paramStr.join("&")}`;
}

class APIHuflit {
	constructor() {
		this.jar = request.jar();
		request = request.defaults({
			resolveWithFullResponse: true,
			simple: false,
			headers: {
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59",
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "vi,en-US;q=0.9,en;q=0.8",
			},
		});
	}
	requestServer(data = { URI, formData: "" }) {
		console.log(API_SERVER + data.URI);
		let form = {
			uri: API_SERVER + data.URI,
			jar: this.jar,
			method: typeof data.formData === "object" ? "post" : "get",
			formData: data.formData,
			transform: (body) => cheerio.load(body),
		};
		return request(form);
	}
	login({ user, pass }) {
		return new Promise(async (resolve, reject) => {
			try {
				const $ = await this.requestServer({
						URI: "/Login",
						formData: {
							txtTaiKhoan: user,
							txtMatKhau: pass,
						},
					}),
					checkUser = $("a.stylecolor span").text();
				if (checkUser.indexOf(user) >= 0) {
					resolve({
						success: true,
						cookie: this.jar.getCookieString(API_SERVER),
						name: checkUser,
					});
				}

				reject({ success: false, msg: "Wrong user or pass" });
			} catch (err) {
				console.log(err);
				reject({ success: false, msg: "server error" });
			}
		});
	}
	getSchedules(semester) {
		return new Promise(async (resolve, reject) => {
			try {
				let Schedules = [],
					res = {
						success: false,
						msg: "Please Login Again...",
					};
				const $ = await this.requestServer({
					URI: makeURL("/Home/DrawingSchedules", {
						YearStudy: "2020-2021",
						TermID: semester,
						Week: 15,
					}),
					formData: "",
				});

				if (!$("title").text()) {
					$(".Content").each(function () {
						Schedules = [...Schedules, subjects($(this))];
					});
					res = { success: true, schedule: Schedules };
				}
				resolve(res);
			} catch (error) {
				console.log(error);
				reject({ success: false, msg: "server error" });
			}
		});
		function subjects(data) {
			return {
				Thu: data.attr("title"),
				Phong: getChild(data, 1).text(),
				MonHoc: splitText(getChild(data, 3), " (", 0),
				TietHoc: splitText(getChild(data, 9), ": ", 1),
				GiaoVien: splitText(getChild(data, 11), ": ", 1),
			};
		}
		function getChild(data, i) {
			return data.children(`:nth-child(${i})`);
		}
		function splitText(query, splitChar, selectIndex) {
			return query.text().split(splitChar)[selectIndex] || "Unknown";
		}
	}
	ChangePass(oldPass, newPass) {
		return new Promise(async (resolve, reject) => {
			try {
				var $ = await this.requestServer({
					URI: makeURL("/API/Student/auther", {
						pw: oldPass,
						pw1: newPass,
						pw2: newPass,
					}),
				});

				if ($.text() == "Mật khẩu cũ không chính xác")
					resolve({ msg: $.text(), success: false });
				resolve({ msg: $.text(), success: true });
			} catch (error) {
				reject({ success: false, msg: "server error" });
			}
		});
	}
	CheckCookie() {
		return new Promise(async (resolve, reject) => {
			try {
				var $ = await this.requestServer({
						URI: "/Home",
					}),
					res = { success: false, msg: "Get Cookie" },
					user = $("a.stylecolor span").text();
				if (user)
					res = {
						success: true,
						name: user,
					};
				resolve(res);
			} catch (error) {
				reject({ success: false, msg: "server error" });
			}
		});
	}
	getMark(studyProgram, year, term) {
		return new Promise(async (resolve, reject) => {
			try {
				const $ = await this.requestServer({
					URI: makeURL("/Home/ShowMark", {
						studyProgram: studyProgram,
						yearStudy: year,
						termID: term,
					}),
				});

				var elements = $("table tbody").children(),
					result = [];

				elements = elements.filter(function () {
					if (isSubject($(this))) return $(this);
				});
				elements.each(function () {
					result.push(Subject($(this)));
				});
				resolve({ success: true, data: result });
			} catch (error) {
				reject({ success: false, msg: "server error" });
			}
			function isSubject(el) {
				return !el.attr("style") && el.children().length > 1;
			}

			function Subject(data) {
				var subject = {
					SubjectTitle: getChild(data, 3),
					Credits: getChild(data, 4),
				};
				if (getChild(data, 5) && getChild(data, 6)) {
					subject.Score = getChild(data, 5);
					subject.ScoreChar = getChild(data, 6);
				}
				return subject;
			}
			function getChild(data, index) {
				return data.children(`:nth-child(${index})`).text().trim();
			}
			function getDetailMark() {}
		});
	}
}

module.exports = APIHuflit;
