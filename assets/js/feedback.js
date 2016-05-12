// DOM elements
$feedbackArea = $('#feedback-area');
$feedbackLink = $('#feedback-link');

// Events
$feedbackArea.on('submit', 'form', function(e) {
  e.preventDefault();
  $.post('/js-submit/feedback-form', $feedbackArea.find('form').serialize(), function(data) {
    handleResponse(data);
  });
});

$feedbackArea.on('click', '#reset', function(e) {
  e.preventDefault();
  $feedbackArea.slideUp(function() {
    $feedbackArea.load('/js-load/feedback-form');
  })
});

$feedbackArea.on('click', '#reload', function(e) {
  e.preventDefault();
  $feedbackArea.slideUp(function() {
    $feedbackArea.load('/js-load/feedback-form', function() {
      $feedbackArea.slideDown();
    });
  })
});

// Handling the various server responses
var handleResponse = function(data) {
  $feedbackArea.html(data);
};

// Load in the initial feedback form:
$feedbackArea.hide().load('/js-load/feedback-form');

// Hijack the feedback link:
$feedbackLink.on('click', function(event) {
  event.preventDefault();
  $feedbackArea.slideDown();
});
