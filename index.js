var bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');
const huflit = require('./modules/Huflit');

const app =  express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', 'static');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.all('/', function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     next()
});

app.get('/', cors(), function(req, res){
     res.render('index');
});

app.post('/profile', cors(),async (req, res, next) => {
     try{
          const API = new huflit();
          res.json(await API.login(req.body));
     }catch(error){
          res.send(error);          
     }
});

app.post('/CheckCookie', cors(), async (req, res, next) =>{
     try {
          const API = new huflit();
          API.jar.setCookie(req.body.cookie, 'https://portal.huflit.edu.vn')
          res.send(await API.CheckCookie());
     } catch (error) {
          res.send(error);
     }
});

app.post('/Schedules', cors(), async (req, res, next) => {
     try{
          const API = new huflit();
          API.jar.setCookie(req.body.cookie, 'https://portal.huflit.edu.vn');
          var data = await API.getSchedules('HK01');
          res.send(data);
     }catch(error){
          res.send(error);
     }
});

app.post('/ChangePass', cors(), async(req, res, next) => {
     try {
          const API = new huflit();
          API.jar.setCookie(req.body.cookie, 'https://portal.huflit.edu.vn');
          res.send(await API.ChangePass(req.body.oldPass, req.body.newPass));
     } catch (error) {
          res.send(error);
     }
});

app.get('/openServer', cors(), function(req, res){
     res.send(true);
})

app.post('/fee', cors(), async function(req, res){
     try {
          const API = new huflit();
          API.jar.setCookie(req.body.cookie, 'https://portal.huflit.edu.vn');
          res.send(await API.getFee());
     } catch (error) {
          res.send(error);
     }
})

app.listen(process.env.PORT || port, () => console.log("Server is running..."));