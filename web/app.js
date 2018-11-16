var express = require("express");
var request = require("request");

var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static("public"));

app.get("/kabric/get/:key", (req, res) => {
  var key = req.params.key;
  console.log(key);
  var reqUrl = "http://localhost:4001/get/" + key;
  request(reqUrl, (error, response, body) => {
    console.log("error:", error);
    console.log("statusCode:", response && response.statusCode);
    console.log("body:", body);

    res.send({
      error: error,
      response: response,
      body: body
    });
  });
});

app.post("/kabric/set", (req, res) => {
  //
  let key = req.body.key;
  let value = req.body.value;
  
  console.log("key: ", key);
  console.log("value: ", value);
  
  var options = {
    uri: "http://localhost:4001/set",
    method: "POST",
    json: true,
    body: {
      key: key,
      value: value
    }
  }

  request(options, (error, response, body) => {
    //
    console.log("error:", error);
    console.log("statusCode:", response && response.statusCode);
    console.log("body:", body);
    //
    res.send({
      error: error,
      response: response,
      body: body
    });
  });
});

app.listen(3001, function() {
  console.log("Example app listening on port 3001!");
});
