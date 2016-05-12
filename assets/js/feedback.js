// DOM elements
$feedbackLink = $('#feedback-link');
$feedbackFormArea = $('#feedback-form-area');
$feedbackLoading = $('#feedback-loading');

$feedbackLoading.addClass('feedback-loading-panel').hide();

// Events
$feedbackFormArea.on('submit', 'form', function(e) {
  e.preventDefault();
  $feedbackLoading.fadeIn();
  $.post('/js-submit/feedback-form', $feedbackFormArea.find('form').serialize(), function(data) {
    $feedbackFormArea.html(data);
    $feedbackLoading.hide();
    $('html, body').animate({ scrollTop: 0 }, 300);
  });
});

$feedbackFormArea.on('click', '#reset', function(e) {
  e.preventDefault();
  $feedbackFormArea.slideUp(function() {
    $feedbackFormArea.load('/js-load/feedback-form');
  })
});

$feedbackFormArea.on('click', '#reload', function(e) {
  e.preventDefault();
  $feedbackFormArea.slideUp(function() {
    $feedbackFormArea.load('/js-load/feedback-form', function() {
      $feedbackFormArea.slideDown();
    });
  })
});

// Load in the initial feedback form:
$feedbackFormArea.hide().load('/js-load/feedback-form');

// Hijack the feedback link:
$feedbackLink.on('click', function(event) {
  event.preventDefault();
  $feedbackFormArea.slideDown();
});
