var bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const huflit = require('./modules/Huflit')

const app =  express()
const port = 3000

app.use(cors())
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

app.all('/', function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     next()
});


app.get('/', (req, res) =>{
     console.log(req)
     res.send('Hello World');
})

app.get('/api', (req, res) =>{
     console.log(req.query);
     res.send('success')
})

app.post('/profile', cors(),async (req, res, next) => {
     try{
          const API = new huflit();
          console.log(req.body);
          var data = req.body;
          var profile = await API.login(data);
          // res.json(req.body);
          res.json(profile)
          console.log('success')
     }catch(error){
          console.log(error);
          res.send(error);
     }
})

app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));