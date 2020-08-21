var bodyParser = require('body-parser')
const express = require('express')
const huflit = require('./modules/Huflit')



const app =  express()
const port = 3000

app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) =>{
     console.log(req)
     res.send('Hello World');
})

app.get('/api', (req, res) =>{
     console.log(req.query);
     res.send('success')
})

app.post('/profile', async (req, res, next) => {
     const API = new huflit();
     console.log(req.body);
     var data = req.body;
     var profile = await API.login(data);
     // res.json(req.body);
     res.send(profile)
})

app.listen(port, () =>{
     console.log(`server start in http://localhost:${port}`)
})