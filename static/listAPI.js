module.exports = [
	{
		id: "Login",
		nameAPI: "Login (Get Cookie)",
		path: "/Login",
		method: "POST",
		form: { name: "mssv", pass: "matkhau" },
		res: {
			cookie: "your cookie portal.huflit.",
			name: "your name in portal.huflit.",
			success: true,
		},
		error: {
			msg: '"Wrong user or password" || "server error".',
			success: false,
		},
	},
	{
		id: "CheckCookie",
		nameAPI: "Check Cookie",
		path: "/CheckCookie",
		method: "POST",
		form: { cookie: "your cookie portal.huflit.edu.vn." },
		res: { name: "your name in portal.huflit.", success: true },
		error: {
			msg: '"Cookie null" || "Get Cookie" || "server error".',
			success: false,
		},
	},
	{
		id: "GetSchedule",
		nameAPI: "Get Schedule",
		path: "/GetSchedule",
		method: "POST",
		form: { cookie: "your cookie portal.huflit.edu.vn" },
		res: { schedule: [{ subject: {} }], success: true },
		error: {
			msg: '"Cookie null" || "Get Cookie" || "server error".',
			success: false,
		},
	},
	{
		id: "ChangePass",
		nameAPI: "Change Password",
		path: "/ChangePass",
		method: "POST",
		form: {
			cookie: "your cookie portal.huflit.edu.vn",
			newPass: "new password",
			oldPass: "old password",
		},
		res: { msg: '"Cập nhật mật khẩu thành công..."', success: true },
		error: {
			msg:
				'"Mật khẩu cũ không chính xác" || "Cookie null" || "Get Cookie" || "server error".',
			success: false,
		},
	},
	{
		id: "GetMark",
		nameAPI: "Get Mark",
		path: "/GetMark",
		method: "POST",
		form: { cookie: "your cookie portal.huflit.edu.vn" },
		res: { data: [{ subject: {} }], success: true },
		error: {
			msg: '"Cookie null" || "Get Cookie" || "server error".',
			success: false,
		},
	},
];
