// DOM elements
$feedbackBar = $('#feedback-bar');
$feedbackLink = $('#feedback-link');
$feedbackFormArea = $('#feedback-form-area');
$feedbackLoading = $('#feedback-loading');

var loadingText = 'Submitting your information, please wait&hellip;';

$feedbackLoading.addClass('feedback-loading-panel').hide().text(loadingText);

// Events
$feedbackFormArea.on('submit', 'form', function(e) {
  e.preventDefault();
  var stage = $feedbackFormArea.find('form [name="stage"]').val();
  $feedbackLoading.fadeIn();
  $.post('/js-submit/feedback-form', $feedbackFormArea.find('form').serialize(), function(data) {
    $feedbackFormArea.html(data);
    $feedbackLoading.hide();
    $('html, body').animate({ scrollTop: 0 }, 300);
    if ($('#feedback-complete').length > 0) {
      $feedbackBar.slideDown({
          'easing': 'easeOutCubic'
        });
      var timeoutID = window.setTimeout(function() {
        $feedbackFormArea.slideUp({
            'easing': 'easeOutCubic',
            'complete': function() {
              $feedbackFormArea.load('/js-load/feedback-form');
            }
          });
        window.clearTimeout(timeoutID);
        timeoutID = undefined;
      }, 5000);
    }
  });
});

$feedbackFormArea.on('click', '#reset', function(e) {
  e.preventDefault();
  $feedbackBar.slideDown({
      'easing': 'easeOutCubic'
    });
  $feedbackFormArea.slideUp({
      'easing': 'easeOutCubic'
    }, function() {
      $feedbackFormArea.load('/js-load/feedback-form');
    });
});

$feedbackFormArea.on('click', '#reload', function(e) {
  e.preventDefault();
  $feedbackFormArea.slideUp(function() {
    $feedbackFormArea.load('/js-load/feedback-form', function() {
      $feedbackFormArea.slideDown({
          'easing': 'easeOutCubic'
        });
    });
  });
});

// Load in the initial feedback form:
$feedbackFormArea.hide().load('/js-load/feedback-form');

// Hijack the feedback link:
$feedbackLink.on('click', function(event) {
  event.preventDefault();
  $feedbackBar.slideUp({
      'easing': 'easeOutCubic'
    });
  $feedbackFormArea.slideDown({
      'easing': 'easeOutCubic'
    });
});
