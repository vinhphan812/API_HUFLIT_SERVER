const url = require("url"),
	query = require("querystring");

var request = require("request-promise"),
	cheerio = require("cheerio");

function Link(extns = { h: "", p, q: {} }) {
	return url.format({
		protocol: "https",
		hostname: extns.h,
		pathname: extns.p,
		query: extns.q,
	});
}

class APIHuflit {
	constructor() {
		this.host = "portal.huflit.edu.vn";
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
		console.log(Link(data.URI));
		try {
			data.URI = Link(data.URI);
			let form = {
				uri: data.URI,
				jar: this.jar,
				method: typeof data.formData == "object" ? "post" : "get",
				formData: data.formData,
				transform: (body) => cheerio.load(body),
			};

			return request(form);
		} catch (error) {
			console.log(error);
		}
	}
	login({ user, pass }) {
		return new Promise(async (resolve, reject) => {
			try {
				let $ = await this.requestServer({
						URI: { h: this.host, p: "Login" },
						formData: {
							txtTaiKhoan: user,
							txtMatKhau: pass,
						},
					}),
					checkUser = $("a.stylecolor span").text();

				if (checkUser.indexOf(user) >= 0) {
					$ = await this.requestServer({
						URI: { h: this.host, p: "/Home/Schedules" },
					});
					resolve({
						success: true,
						cookie: this.jar.getCookieString(
							"https://" + this.host
						),
						name: checkUser,
						term: $("#TermID").val(),
						year: $("#YearStudy").val(),
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
					URI: {
						h: this.host,
						p: "/Home/DrawingSchedules",
						q: {
							YearStudy: "2020-2021",
							TermID: semester,
							Week: 15,
						},
					},
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
					URI: {
						h: this.host,
						p: "/API/Student/auther",
						q: {
							pw: oldPass,
							pw1: newPass,
							pw2: newPass,
						},
					},
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
						URI: { h: this.host, p: "/Home" },
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

	getMark(studyProgram) {
		return new Promise(async (resolve, reject) => {
			const isSubject = (el) =>
				!el.attr("style") && el.children().length > 1;
			Subject = Subject.bind(this);

			try {
				if (!studyProgram) {
					const $ = await this.requestServer({
						URI: { h: this.host, p: "/Home/Marks" },
					});
					studyProgram = $($("option")[0]).val();
				}

				const $ = await this.requestServer({
					URI: {
						h: this.host,
						p: "/Home/ShowMark",
						q: {
							studyProgram: studyProgram,
							yearStudy: 0,
							termID: 0,
						},
					},
				});

				var elements = $("table tbody").children(),
					result = [],
					elements = elements.filter(function () {
						if (isSubject($(this))) return $(this);
					});

				for (var i = 0; i < elements.length; i++) {
					var isDoing = false,
						code = getChild($(elements[i]), 2);
					if (!getChild($(elements[i]), 6)) {
						result.push(await Subject($(elements[i])));
					} else {
						if (result.length > 0)
							isDoing = result.find(function (i) {
								if (i.code == code) return true;
							});
						if (!isDoing) {
							result.push(await Subject($(elements[i])));
						}
					}
				}
				resolve({
					success: true,
					data: result,
					sProgram: studyProgram,
				});
			} catch (error) {
				console.log(error);
				reject(error);
			}

			function Subject(data) {
				var el = data.find(":nth-child(8)>img").attr("onclick")
					? data
							.find(":nth-child(8)>img")
							.attr("onclick")
							.split("'")[1]
					: "";
				return {
					code: getChild(data, 2),
					subject: getChild(data, 3),
					credits: +getChild(data, 4),
					score: +getChild(data, 5) || null,
					scoreChar: getChild(data, 6) || null,
					survey: surveyCode(data),
					codeDetail: el || "",
				};
			}

			function surveyCode(data) {
				var survey =
					data.find(":nth-child(5)>a").attr("href") || null;
				if (survey) survey = query.parse(url.parse(survey).query);
				return survey;
			}
			function getChild(data, index) {
				return data.children(`:nth-child(${index})`).text().trim();
			}
		});
	}
	getDetailMark(path) {
		return new Promise(async (resolve, reject) => {
			let title = [],
				score = [];
			const $ = await this.requestServer({
				URI: {
					h: this.host,
					p: "Home/ShowMarkDetail/" + path,
				},
			});
			var el = $("tbody>tr:not(:first-child)");
			el.each(function (e) {
				title.push($("td:nth-child(2)", this).text());
				score.push(+$("td:nth-child(3)", this).text());
			});
			resolve({ sContent: title, sDetail: score });
		});
	}
	Survey({ SID, PID, classId, auth, YearStudy, TermID }, type) {
		//? type [0,4]
		return new Promise(async (resolve, reject) => {
			requestJSON = requestJSON.bind(this);
			const sHost = "esurvey.huflit.edu.vn",
				p = [
					"/FrontEnd/VoteRatingTemplate/VoteIndex.aspx",
					"/FrontEnd/VoteRatingTemplate/Vote.aspx/GetData",
				];
			try {
				//? login "esurvey.huflit.edu.vn"
				await this.requestServer({
					URI: {
						h: sHost,
						p: p[0],
						q: {
							SID: SID,
							PID: PID,
							classId: classId,
							auth: auth,
							YearStudy: YearStudy,
							TermID: TermID,
						},
					},
				});

				//? after, getData JSON
				var data = JSON.parse(
					await requestJSON({
						URI: {
							h: sHost,
							p: p[1],
						},
						body: {
							curClassId: classId,
							sid: SID,
							studyYearId: YearStudy,
							termId: TermID,
						},
					})
				);
				//? make data voted
				let rating = data.RatingTemplates;

				for (var parent in rating) {
					var questions = rating[parent].QuestionDTOs,
						answer = rating[parent].AnswerDTOs;

					for (var i = 0; i < questions.length; i++) {
						if (answer.length)
							questions[i] = checkAnswer(
								questions[i],
								answer[type].Id
							);
						else
							questions[i].AnswerDTOs[0].TextAnswer =
								"Khong!!!";
					}
					rating[parent].QuestionDTOs = questions;
				}

				data.RatingTemplates = rating;
				data = JSON.stringify(data);
				const form = {
					answerObject: data,
					informationContent: "{}",
					captchaText: "",
					classId: classId,
					sid: SID,
				};
				var res = await requestJSON({
					URI: { h: sHost, p: p[0] + "/SendAnswer" },
					body: form,
				});
				if (res == "OK") resolve({ success: true, msg: res });
				else resolve({ success: false, msg: res });
			} catch (error) {
				console.log(error);
				reject(error);
			}
			function checkAnswer(question, answer) {
				if (!question.ChildQuestions)
					question.RadioAnswerValue = question.Id + "_" + answer;
				else {
					var le = question.ChildQuestions.length;
					for (var i = 0; i < le; i++)
						question.ChildQuestions[i] = checkAnswer(
							question.ChildQuestions[i],
							answer
						);
				}

				return question;
			}
			function requestJSON({ URI, body }) {
				console.log(Link(URI));
				var form = {
					uri: Link(URI),
					method: "post",
					jar: this.jar,
					body: body,
					json: true,
					transform: (body) => body.d,
				};
				return request(form);
			}
		});
	}
}

module.exports = APIHuflit;
