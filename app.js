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

// **************************** ENDPOINT FUNCTIONS *****************************

// Error checking
var checkInput = function(req, stage) {

  if (stage === 'feedback-form') {
    req.checkBody('feedback-form-comments', 'Please add your comments.').notEmpty();
  } else if (stage === 'volunteer-form') {
    req.checkBody('volunteer-form-name', 'Please give us your name.').notEmpty();
    req.checkBody("volunteer-form-email", "Please enter a valid email.").isEmail();
  }

  var errors = req.validationErrors();
  if (errors) {
    return errors;
  }

};

var getNow = function() {
  return moment().tz("Europe/London").format('YYYY-MM-DD HH:mm:ss');
}

var endpointOptions = {
  method: 'POST',
  uri: 'https://feedbacknhsuk.azure-api.net/add',
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': process.env.API_KEY
  }
};

// ************************** STANDARD FORM FEEDBACK ***************************

app.get('/feedback/feedback-example/feedback', function(req, res) {
  res.render('feedback/feedback-example', {
    display: 'feedback-form'
  });
});

// let's post from dummy forms
app.post('/feedback/feedback-example/feedback', function(req, res) {

  var stage = req.body['stage'];

  // check for errors
  var inputErrors = checkInput(req, stage);

  if (typeof inputErrors !== 'undefined') {
    if (stage === 'feedback-form') {
      res.render('feedback/feedback-example', {
        display: 'feedback-form',
        errors: inputErrors
      });
      return false;
    } else if (stage === 'volunteer-form') {
      res.render('feedback/feedback-example', {
        display: 'volunteer-form',
        errors: inputErrors,
        nameVal: req.body['volunteer-form-name'],
        emailVal: req.body['volunteer-form-email']
      });
    }
    return;
  }

  // Sanitise submitted data
  if (stage === 'feedback-form') {
    var feedback = req.sanitizeBody('feedback-form-comments').escape();
  } else if (stage === 'volunteer-form') {
    var name = req.sanitizeBody('volunteer-form-name').escape();
    var email = req.body['volunteer-form-email'];
  }

  var rightNow = getNow();
  var referrer = req.headers['referer'];

  if (stage === 'feedback-form') {
    var submission = {
     "userId": req.session.ID,
     "jSonData": "{'referrer': '" + referrer + "', 'stage': '" + stage + "'}",
     "text": feedback,
     "dateAdded": rightNow
    }
  } else if (stage === 'volunteer-form') {
    var submission = {
     "userId": req.session.ID,
     "jSonData": "{'name': '" + name + "','referrer': '" + referrer + "', 'stage': '" + stage + "'}",
     "emailAddress": email,
     "dateAdded": rightNow
    }
  }

  endpointOptions.form = submission;

  request(endpointOptions, function(error, response, body) {
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
      res.render('feedback/feedback-example', {
        display: 'server-error'
      });
      console.log(response.statusCode + ' and ' + error);
    }
  });

});

// ************************ END STANDARD FORM FEEDBACK *************************

// *************************** JS ENHANCED FEEDBACK ****************************

// Feeback form snippet
app.get('/js-load/feedback-form', function(req, res) {
  res.render('_includes/feedback-form');
});

// Handle $.ajax POST from feedback form
app.post('/js-submit/feedback-form', function(req, res) {

  var stage = req.body['stage'];

  // check for errors
  var inputErrors = checkInput(req, stage);

  if (typeof inputErrors !== 'undefined') {
    if (stage === 'feedback-form') {
      res.render('_includes/feedback-form', {
        errors: inputErrors
      });
      return false;
    } else if (stage === 'volunteer-form') {
      res.render('_includes/feedback-volunteer', {
        errors: inputErrors,
        nameVal: req.body['volunteer-form-name'],
        emailVal: req.body['volunteer-form-email']
      });
    }
    return;
  }

  // Sanitise submitted data
  if (stage === 'feedback-form') {
    var feedback = req.sanitizeBody('feedback-form-comments').escape();
  } else if (stage === 'volunteer-form') {
    var name = req.sanitizeBody('volunteer-form-name').escape();
    var email = req.body['volunteer-form-email'];
  }

  var rightNow = getNow();
  var referrer = req.headers['referer'];

  if (stage === 'feedback-form') {
    var submission = {
     "userId": req.session.ID,
     "jSonData": "{'referrer': '" + referrer + "', 'stage': '" + stage + "'}",
     "text": feedback,
     "dateAdded": rightNow
    }
  } else if (stage === 'volunteer-form') {
    var submission = {
     "userId": req.session.ID,
     "jSonData": "{'name': '" + name + "','referrer': '" + referrer + "', 'stage': '" + stage + "'}",
     "emailAddress": email,
     "dateAdded": rightNow
    }
  }

  endpointOptions.form = submission;

  request(endpointOptions, function(error, response, body) {

    // without server calls
    /*if (stage === 'feedback-form') {
      res.render('_includes/feedback-volunteer');
    } else if (stage === 'volunteer-form') {
      res.render('_includes/feedback-thanks');
    }*/

    // 201: resource created
    if (!error && response.statusCode == 201) {
      if (stage === 'feedback-form') {
        res.render('_includes/feedback-volunteer');
      } else if (stage === 'volunteer-form') {
        res.render('_includes/feedback-thanks');
      }
      console.log(response['body']);
    } else {
      res.render('_includes/feedback-error');
      console.log(response['body']);
    }
  });

});

// ************************* END JS ENHANCED FEEDBACK *************************

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
