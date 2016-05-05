var express = require('express');
var nunjucks = require('express-nunjucks');
var request = require('request');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var moment = require('moment-timezone');
var cookieSession = require('cookie-session');
var uuid = require('node-uuid');
var app = express();

// Application settings
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static('assets'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator()); // this line must be immediately after express.bodyParser()!

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

app.use(cookieSession({
  secret: 'tborqwitno'
}));

app.use(function (req, res, next) {
  // Generate a v4 (random) id like '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
  req.session.ID = (req.session.ID || uuid.v4());
  next();
})

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

app.get('/feedback/feedback-example/feedback', function(req, res) {
  res.render('feedback/feedback-example', {
    display: 'feedback-form'
  });
});

// let's post from dummy forms
app.post('/feedback/feedback-example/feedback', function(req, res) {

  var stage = req.body['stage'];

  // check for errors and sanitise

  if (stage === 'feedback-form') {
    req.checkBody('feedback-form-comments', 'Please add your comments.').notEmpty();
    var feedback = req.sanitizeBody('feedback-form-comments').escape();
  } else if (stage === 'volunteer-form') {
    req.checkBody('volunteer-form-name', 'Please give us your name.').notEmpty();
    var name = req.sanitizeBody('volunteer-form-name').escape();
    req.checkBody("volunteer-form-email", "Please enter a valid email.").isEmail();
    var email = req.body['volunteer-form-email'];
  }

  var referrer = req.sanitizeBody('referrer').escape();
  var page = req.sanitizeBody('page').escape();
  var now = moment().tz("Europe/London").format();

  var errors = req.validationErrors();
  if (errors) {
    if (stage === 'feedback-form') {
      res.render('feedback/feedback-example', {
        display: 'feedback-form',
        errors: errors
      });
    } else if (stage === 'volunteer-form') {
      res.render('feedback/feedback-example', {
        display: 'volunteer-form',
        errors: errors,
        nameVal: name,
        emailVal: email
      });
    }
    return;
  }

  if (stage === 'feedback-form') {
    var submission = {
     "userId": req.session.ID,
     "jSonData": "{'referrer': '" + referrer + "', 'stage': '" + stage + "'}",
     "text": feedback,
     "dateAdded": now,
     "pageId": page
    }
  } else if (stage === 'volunteer-form') {
    var submission = {
     "userId": req.session.ID,
     "jSonData": "{'name': '" + name + "','referrer': '" + referrer + "', 'stage': '" + stage + "'}",
     "emailAddress": email,
     "dateAdded": now,
     "pageId": page
    }
  }

  var options = {
    method: method,
    uri: endpoint,
    form: submission,
    headers: headers
  };

  request(options, function(error, response, body) {
    // 201: resource created
    if (!error && response.statusCode == 201) {
      if (stage === 'feedback-form') {
        res.render('feedback/feedback-example', {
          display: 'volunteer-form'
        });
      } else if (stage === 'volunteer-form') {
        res.render('feedback/feedback-example', {
          display: 'thanks-message'
        });
      }
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
