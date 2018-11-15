var express = require('express');
var app = express();

app.use(express.static('public'));

app.get("/kabric-chain-code", async (req, res) => {
    res.send("hello kabric from web api");
})


app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});
