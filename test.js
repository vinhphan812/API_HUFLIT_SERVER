const query = require("querystring");
const url = require("url");
const HUFLIT = require("./modules/huflit"),
	api = new HUFLIT();

const info = {
	user: "19dh110251",
	pass: "14052001",
};
(async () => {
	// var user = await api.login(info);
	try {
		api.jar.setCookie(
			"ASP.NET_SessionId=5madzcda0zlbebfbii1gy5yr",
			"https://portal.huflit.edu.vn"
		);
		var is = await api.CheckCookie();
		console.log(is);

		if (!is.success) return;
		var mark = await api.getMark();
		mark = mark.data.filter(function (i) {
			if (i.survey) return i;
		});
		// for (var i of mark) {
		var res = await api.Survey(
			{
				SID: "202101005274",
				PID: "19dh110251",
				classId: 1,
				auth: "c7fac99d863f4bc9804b81ecf98d9181",
				YearStudy: "2020-2021",
				TermID: "HK02",
			},
			4
		);
		console.log(res);
		// }
	} catch (error) {
		console.log(error);
	}
	// var schedule = await api.getSchedules("HK02");
	// console.log(schedule);
})();
