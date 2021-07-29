const http = require('http');
let app = require('./app')

const port = process.env.PORT || 3001;

const server = http.createServer(app)

server.listen(port)