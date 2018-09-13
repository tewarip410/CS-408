var express = require('express');
var app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('docker');
});

app.get('/map', function(req, res) {
  res.render('map');
})

app.get('/test', function(req, res) {
  res.render('test');
})

app.listen(8081, function() {
  console.log('app started on port 8081');
});
