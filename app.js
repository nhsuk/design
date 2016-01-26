var express = require('express');
var nunjucks = require('express-nunjucks');
var app = express();

// Application settings
app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

nunjucks.setup({
  autoescape: true,
  watch: true,
  noCache: true
}, app);

app.get('/', function (req, res) {
  res.render('index', { foo: 'bar' });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
