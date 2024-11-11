const express = require('express')
var path = require('path');
const app = express()
const port = 3000

app.use(express.json())
app.use(express.static('public'))

var public = path.join(__dirname, 'public');


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/home', (req, res) => {
  res.sendFile(path.join(public, 'index.html'))
})

app.post('/hi', (req, res) => {
  res.send({
    text: `hi ${req.body.name}`
  })
})

app.get('/sample-query', (req, res) => {
  res.send({
    text: `hi ${req.query.a}`
  })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})