$.get('assets/json/songs.json', data => {
  var song, alarm, init = true,
    tracker = $('.tracker'),
    randImg = [], curVolume = 100;

  for (var i = 1; i <= 8; i++) randImg.push('avatar-' + i + '.jpg');

  $('.js-playlist-total').text(data.length);

  data.forEach((item, index) => {
    $('.js-playlist')
      .append('<li class="col-lg-6" title="' + item.title + '" data-url="' + item.url + '"><span class="js-list-song">' + (index + 1) + '. ' + item.title + '</span></li>');
  });

  initAudio($('.js-playlist li:first-child'));

  function initAudio(elem) {
    var url = elem.attr('data-url'),
      title = elem.text(),
      artist = 'Hung1001';

    $('.js-title').text(title);
    $('.js-artist').text(artist);
    if (!init) {
      $('.js-track-thumb-img').attr('src', 'assets/img/' + randImg[Math.floor(Math.random() * randImg.length)]);
    }
    song = new Audio(url);
    song.addEventListener('timeupdate', function () {
      var curtime = parseInt(song.currentTime, 10),
        timeLeft = parseInt(song.duration) - curtime,
        sUp = parseInt(song.currentTime % 60),
        mUp = parseInt((song.currentTime / 60) % 60),
        sDown = timeLeft % 60,
        mDown = Math.floor(timeLeft / 60) % 60;
      sDown = sDown < 10 ? '0' + sDown : sDown;
      mDown = mDown < 10 ? '0' + mDown : mDown;

      if (sUp < 10) {
        $('.js-duration-countup').html(mUp + ':0' + sUp);
      } else {
        $('.js-duration-countup').html(mUp + ':' + sUp);
      }

      $('.js-duration-coundown').html(mDown + ':' + sDown);
      tracker.slider('value', curtime);
    });

    song.addEventListener('ended', function () {
      var next = $('.js-playlist li.active').next();
      if ($('.js-loop-one').hasClass('looped')) {
        song.currentTime = 0;
        playRequest(song);
        return;
      }

      if ($('.js-shuffle').hasClass('shuffled')) {
        next = $('.js-playlist li').eq(Math.floor(Math.random() * data.length));
        initAudio(next);
        song.addEventListener('loadedmetadata', function () {
          playAudio();
        });
      } else {
        if ($('.js-loop-all').hasClass('looped')) {
          if (next.length == 0) {
            next = $('.js-playlist li:first-child');
          }
          initAudio(next);
          song.addEventListener('loadedmetadata', function () {
            playAudio();
          });
        } else {
          $('.js-track-thumb').removeClass('play');
          if (next.length != 0) {
            initAudio(next);
            song.addEventListener('loadedmetadata', function () {
              playAudio();
            });
          }
          return;
        }
      }
    }, false);

    $('.js-playlist li').removeClass('active');
    elem.addClass('active');
  }

  var playRequest = (ele, pause = false) => {
    var playPromise = ele.play();
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        if (pause === true) {
          ele.pause();
        }
      }).catch(error => { });
    }
  };

  var playAudio = () => {
    playRequest(song);
    tracker.slider('option', 'max', song.duration);
    $('.js-play').addClass('d-none');
    $('.js-pause').addClass('d-flex');
  };

  var stopAudio = () => {
    playRequest(song, true);
    $('.js-play').removeClass('d-none');
    $('.js-pause').removeClass('d-flex');
  };

  $('body').on('click', '.js-play', function (e) {
    e.preventDefault();
    $('.js-track-thumb').addClass('play');
    tracker.slider('option', 'max', song.duration);
    playRequest(song);
    $('.js-play').addClass('d-none');
    $('.js-pause').addClass('d-flex');
  });

  $('body').on('click', '.js-pause', function (e) {
    e.preventDefault();
    stopAudio();
    $('.js-track-thumb').removeClass('play');
  });

  $('body').on('click', '.js-next', function (e) {
    e.preventDefault();
    stopAudio();
    var next;
    init = false;
    if ($('.js-shuffle').hasClass('shuffled')) {
      next = $('.js-playlist li').eq(Math.floor(Math.random() * data.length));
    } else {
      next = $('.js-playlist li.active').next();
      if (next.length === 0) {
        next = $('.js-playlist li:first-child');
      }
    }
    initAudio(next);
    song.addEventListener('loadedmetadata', function () {
      playAudio();
      $('.js-track-thumb').addClass('play');
    });
  });

  $('body').on('click', '.js-prev', function (e) {
    e.preventDefault();
    stopAudio();
    var prev;
    init = false;
    if ($('.js-shuffle').hasClass('shuffled')) {
      prev = $('.js-playlist li').eq(Math.floor(Math.random() * data.length));
    } else {
      prev = $('.js-playlist li.active').prev();
      if (prev.length === 0) {
        prev = $('.js-playlist li:last-child');
      }
    }
    initAudio(prev);
    song.addEventListener('loadedmetadata', function () {
      playAudio();
      $('.js-track-thumb').addClass('play');
    });
  });

  $('body').on('click', '.js-list-song', function () {
    stopAudio();
    initAudio($(this).parent());
    init = false;
    song.addEventListener('loadedmetadata', function () {
      playAudio();
      $('.js-track-thumb').addClass('play');
    });
  });

  song.volume = 1;

  $('.js-controls').clone(true).appendTo('.js-fixed-player');

  $('.js-volume').each(function () {
    $(this).slider({
      classes: {
        'ui-slider-handle': 'controls__volume--handle js-volume-handle',
        'ui-slider-range': 'controls__volume--range js-volume-range'
      },
      orientation: 'vertical',
      range: 'min',
      min: 0,
      max: 100,
      value: 100,
      slide: function (event, ui) {
        var _value = ui.value;
        song.volume = _value / 100;
        $('.js-volume').not(this).slider('value', ui.value);
        if (_value == 0) {
          song.muted = true;
          $('.js-volume-toggle .icons').addClass('off');
        } else {
          song.muted = false;
          $('.js-volume-toggle .icons').removeClass('off');
        }

        if (!song.muted) {
          curVolume = _value;
        }
      }
    });
  });

  $('body').on('click', '.js-volume-toggle .icons', function () {
    song.muted = !song.muted;
    if (song.muted) {
      $('.js-volume-toggle .icons').addClass('off');
      $('.js-volume').slider('value', 0);
    } else {
      $('.js-volume-toggle .icons').removeClass('off');
      $('.js-volume').slider('value', curVolume);
    }
  });

  tracker.slider({
    classes: {
      'ui-slider-handle': 'tracker--handle',
      'ui-slider-range': 'tracker--range'
    },
    range: 'min',
    min: 0,
    max: 10,
    slide: function (event, ui) {
      song.currentTime = ui.value;
    }
  });

  $('body').on('click', '.js-dropdown-menu-timer', function (e) {
    e.stopPropagation();
  });

  $('body').on('click', '.js-loop-one', function () {
    $('.js-loop-one').toggleClass('looped');
    $('.js-shuffle').removeClass('shuffled');
  });

  $('body').on('click', '.js-loop-all', function () {
    $('.js-loop-all').toggleClass('looped');
    $('.js-shuffle').removeClass('shuffled');
  });

  $('body').on('click', '.js-shuffle', function () {
    $('.js-shuffle').toggleClass('shuffled');
    $('.js-loop-all, .js-loop-one').removeClass('looped');
  });

  $('.js-fixed-player .js-timer').each(function () {
    var $this = $(this);
    $this.attr({
      id: $this.attr('id') + '-c',
      name: $this.attr('name') + '-c'
    }).next().attr('for', $this.attr('id'));
  });

  $('.js-timer-0').prop('checked', true);

  $('body').on('change', '.js-timer', function () {
    var minute = $(this).attr('data-minute'),
      minutes = parseInt(minute, 10) * 60000;

    $('.js-timer[data-minute="' + minute + '"]').prop('checked', true);
    if (parseInt(minute) > 0) {
      alarm = setTimeout(() => {
        stopAudio();
      }, minutes);
    } else {
      window.clearTimeout(alarm);
      return;
    }
  });
});
