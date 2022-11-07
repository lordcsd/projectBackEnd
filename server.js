const http = require('http');
let app = require('./app')

const listEndpoints = require("express-list-endpoints")

console.log(listEndpoints(app).map(_point => `${_point.path} : ${_point.methods[0]}`))

const port = process.env.PORT || 3001;

const server = http.createServer(app)

server.listen(port)