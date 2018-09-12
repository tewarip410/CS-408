var express = require('express');
var app = express();

app.get('/', (req, res) => {
  res.send('docker');
});

app.listen(8081, function() {
  console.log('app started on port 8081');
});
