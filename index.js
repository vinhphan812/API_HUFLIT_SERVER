const HUFLIT = require('./modules/Huflit'),
     bodyParser = require('body-parser'),
     express = require('express'),
     path = require('path'),
     cors = require('cors'),
     app = express(),
     port = 3000,
     SERVER = 'https://portal.huflit.edu.vn/',
     API = new HUFLIT();


app.set('view engine', 'pug');
app.set('views', 'static');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', cors(), function(req, res) {
     res.render('index');
});

app.post('/profile', cors(), async(req, res, next) => {
     try {
          res.json(await API.login(req.body));
     } catch (error) {
          res.send(error);
     }
});

app.post('/CheckCookie', cors(), async(req, res, next) => {
     try {
          API.jar.setCookie(req.body.cookie, SERVER)
          res.send(await API.CheckCookie());
     } catch (error) {
          res.send(error);
     }
});

app.post('/Schedules', cors(), async(req, res, next) => {
     try {
          API.jar.setCookie(req.body.cookie, SERVER);
          var data = await API.getSchedules('HK01');
          res.send(data);
     } catch (error) {
          res.send(error);
     }
});

app.post('/ChangePass', cors(), async(req, res, next) => {
     try {
          API.jar.setCookie(req.body.cookie, SERVER);
          res.send(await API.ChangePass(req.body.oldPass, req.body.newPass));
     } catch (error) {
          res.send(error);
     }
});

app.get('/openServer', cors(), function(req, res) {
     res.send(true);
})

app.post('/fee', cors(), async function(req, res) {
     try {
          API.jar.setCookie(req.body.cookie, SERVER);
          res.send(await API.getFee());
     } catch (error) {
          res.send(error);
     }
})

app.listen(process.env.PORT || port, () => console.log("Server is running..."));