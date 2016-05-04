var express = require('express');
var nunjucks = require('express-nunjucks');
var request = require('request');
var app = express();

// Application settings
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static('assets'));

// pass analytics codes to all templates
app.use(function(req, res, next){
  res.locals.GOOGLE_ANALYTICS_TRACKING_ID = process.env.GOOGLE_ANALYTICS_TRACKING_ID;
  res.locals.MOUSE_STATS_ACCOUNT_ID = process.env.MOUSE_STATS_ACCOUNT_ID;
  next();
});

nunjucks.setup({
  autoescape: true,
  watch: true,
  noCache: true
}, app);

app.get('/', function (req, res) {
  res.render('index');
});

// Let's try talking to endpoints
app.get('/endpoint-test', function (req, res) {

  var options = {
    method: 'POST',
    uri: 'https://feedbacknhsuk.azure-api.net/add',
    form: {
     "userId": "654321",
     "jSonData": {
       "thing": "something"
     },
     "text": "Testing /endpoint-test from localhost",
     "dateAdded": "2016-05-04 12:28:00",
     "emailAddress": "mat.johnson@digital.nhs.uk",
     "pageId": "endpoint-test",
     "rating": 0
    },
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': '8bfa21c10782495680605bc58c66c923'
    }
  };

  request(options, function(error, response, body) {
    // 201: resource created
    if (!error && response.statusCode == 201) {
      res.send({
        success: true
      });
      console.log(response.statusCode);
    } else {
      res.send({
        success: false
      });
      console.log(response.statusCode + ' and ' + error);
    }
  });

});

// auto render any view that exists
app.get(/^\/([^.]+)$/, function (req, res) {
  var path = (req.params[0]);
  res.render(path, function(err, html) {
    if (err) {
      res.render(path + "/index", function(err2, html) {
        if (err2) {
          console.log(err);
          res.status(404).send(err + "<br>" + err2);
        } else {
          res.end(html);
        }
      });
    } else {
      res.end(html);
    }
  });
});

// start the app
var port = (process.env.PORT || 3000);
app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
