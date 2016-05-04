var express = require('express');
var nunjucks = require('express-nunjucks');
var request = require('request');
var bodyParser = require('body-parser');
var moment = require('moment');
var moment = require('moment-timezone');
var app = express();

// Application settings
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static('assets'));
app.use(bodyParser.urlencoded({ extended: false }));

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

// ******************************** ENDPOINTS ********************************

// Globals
var endpoint = 'https://feedbacknhsuk.azure-api.net/add';
var headers = {
  'Content-Type': 'application/json',
  'Ocp-Apim-Subscription-Key': 'ca86cedb4644425e9175579dd560fdbd' // regenerate and make a config var
};
var method = 'POST';

// let's post feedback from dummy forms
app.post('/page-feedback', function(req, res) {

  var feedback = req.body['feedback-form-comments'];
  var referrer = req.body['feedback-referrer'];
  var page = req.body['feedback-page'];
  var now = moment().tz("Europe/London").format();

  var options = {
    method: method,
    uri: endpoint,
    form: {
     "userId": "SESSION ID?",
     "jSonData": "{'referrer': '" + referrer + "'}",
     "text": feedback,
     "dateAdded": now,
     "pageId": page
    },
    headers: headers
  };

  request(options, function(error, response, body) {
    // 201: resource created
    if (!error && response.statusCode == 201) {
      res.redirect('/feedback/feedback-3');
      console.log(response.statusCode);
    } else {
      res.send({
        success: false
      });
      console.log(response.statusCode + ' and ' + error);
    }
  });
});

// let's get volunteers from dummy forms
app.post('/volunteer-for-research', function(req, res) {

  var name = req.body['feedback-form-name'];
  var email = req.body['feedback-form-email'];
  var referrer = req.body['feedback-referrer'];
  var page = req.body['feedback-page'];
  var now = moment().tz("Europe/London").format();

  var options = {
    method: method,
    uri: endpoint,
    form: {
     "userId": "SESSION ID?",
     "jSonData": "{'name': '" + name + "','referrer': '" + referrer + "'}",
     "dateAdded": now,
     "pageId": page,
     "emailAddress": email
    },
    headers: headers
  };

  request(options, function(error, response, body) {
    // 201: resource created
    if (!error && response.statusCode == 201) {
      res.redirect('/feedback/feedback-4');
      console.log(response.statusCode);
    } else {
      res.send({
        success: false
      });
      console.log(response.statusCode + ' and ' + error);
    }
  });

});

// ******************************* END ENDPOINTS ******************************

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
