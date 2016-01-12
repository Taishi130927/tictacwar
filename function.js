function initialize() {

}

function processMove(move) {

}

function countOn(tc) {

  if (tc <= 300) {

    if (tc === 200) {
      $('.progress-bar').addClass('progress-bar-warning');
    } else if (tc === 270) {
      $('.progress-bar').addClass('progress-bar-danger');
    }

    timerId = setTimeout(function() {

            $('.progress-bar').css('width', 100 - tc * 100 / 300 + '%');
            countOn(tc + 1);

          }, 100);

  } else {

    clearTimeout(timerId);

  }
}
