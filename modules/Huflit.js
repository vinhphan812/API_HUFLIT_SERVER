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
				console.log($("body").html());
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

				// if ($.text() == "Mật khẩu cũ không chính xác")
				// 	reject($.text());
				resolve($.text());
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
					res = { success: false, msg: "GetCookie" };
				if ($("a.stylecolor span").text())
					res = {
						success: true,
						name: $("a.stylecolor span").text(),
					};
				resolve(res);
			} catch (error) {
				reject({ success: false, msg: "server error" });
			}
		});
	}
}

module.exports = APIHuflit;
