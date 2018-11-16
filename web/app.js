var express = require("express");
var request = require("request");

var app = express();

app.use(express.static("public"));

app.get("/kabric-chaincode", (req, res) => {
  
    request("http://localhost:4001/query", function(error, response, body) {
    
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

app.listen(3001, function() {
  console.log("Example app listening on port 3001!");
});
