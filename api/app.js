var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var cors = require('cors');

var app = express();

var hfc = require('fabric-client');

var enrollAdmin = require('./app/enrollAdmin.js');
var registerUser = require('./app/registerUser.js');
var query = require('./app/query.js');
var invoke = require('./app/invoke.js');

app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(4001, function() {});
server.timeout = 240000;

app.post('/enrollAdmin', async function(req, res) {
    await enrollAdmin.enrollAdmin();
	res.send("done");
});

app.post('/registerUser', async function(req, res) {
    await registerUser.registerUser();
	res.send("done");
});

// app.get('/query', async function(req, res) {
//     var result = await query.query();
//     res.send(result);
// })

// app.post('/invoke', async function(req, res) {
//     var result = await invoke.invoke();
//     res.send(result);
// })

app.get('/get/:key', async function(req, res) {
    var key = req.params.key
    var result = await query.query("get", [key]);
    res.send(result);
})