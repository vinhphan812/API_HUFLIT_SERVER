var bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');
const huflit = require('./modules/Huflit');

const app =  express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/', function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     next()
});


app.get('/', (req, res) =>{
     res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/api', (req, res) =>{
     console.log(req.query);
     res.send('success')
})

app.get('/profile', cors(), (req, res, next) =>{
     res.send('Error: you can "POST" not "GET"')
})

app.post('/profile', cors(),async (req, res, next) => {
     try{
          const API = new huflit();
          console.log(req.body);
          var data = req.body;
          var profile = await API.login(data);
          console.log(API.jar)
          // res.json(req.body);
          res.json(profile)
          console.log('success')
     }catch(error){
          console.log(error);
          res.send(error);
     }
})
app.post('/Schedules', cors(), async (req, res, next) => {
     try{
          const API = new huflit();
          var cookie = req.body.cookieJar;
          cookie = JSON.parse(cookie)._jar.cookies[0];
          API.jar.setCookie(cookie.key + "=" + cookie.value, 'https://portal.huflit.edu.vn')
          console.log(API.jar)
          var data = await API.getSchedules('HK01');
          console.log(data)
          res.send(data);

     }catch(error){
          console.log(error)
          res.send(error)
     }
})


app.listen(process.env.PORT || port, () => console.log("Server is running..."));