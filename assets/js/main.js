$.get('assets/json/songs.json', data => {
  var song, alarm, init = true,
    tracker = $('.tracker'),
    randImg = [], randBg = [], curVolume = 100,
    rootFolder = 'https://truongthangit-my.sharepoint.com/personal/hung1001_office365edu_work/Documents/Songs/';

  for (var i = 1; i <= 8; i++) randImg.push('avatar-' + i + '.jpg');
  for (var j = 1; j <= 10; j++) randBg.push('bg-' + j + '.png');

  $('.js-playlist-total').text(data.length);

  data.forEach((item, index) => {
    $('.js-playlist')
      .append('<li class="col-lg-6" title="' + item.title + '" data-url="' + rootFolder + item.url + '"><span class="js-list-song">' + (index + 1) + '. ' + item.title + '</span></li>');
  });

  $('body').on('click', '.js-play', function () {
    playAudio();
  });

  $('body').on('click', '.js-pause', function () {
    stopAudio();
  });

  $('body').on('click', '.js-next', function () {
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
    });
  });

  $('body').on('click', '.js-prev', function () {
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
    });
  });

  $('body').on('click', '.js-list-song', function () {
    if (!$(this).parent().hasClass('active')) {
      stopAudio();
      init = false;
      initAudio($(this).parent());
      song.addEventListener('loadedmetadata', function () {
        playAudio();
      });
    }
  });

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

  function initAudio(elem) {
    $('.js-title').text(elem.text());
    $('.js-artist').text('Hung1001');
    song = new Audio(elem.attr('data-url'));
    if (!init) {
      $('.js-track-thumb-img').attr('src', 'assets/img/' + randImg[Math.floor(Math.random() * randImg.length)]);
      $('.js-songs, .js-fixed-player').css('background-image', 'url(assets/img/' + randBg[Math.floor(Math.random() * randBg.length)] + ')');
      song.volume = $('.js-volume').slider('value') / 100;
    }
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
          if (next.length != 0) {
            initAudio(next);
            song.addEventListener('loadedmetadata', function () {
              playAudio();
            });
          } else {
            stopAudio();
            $('.js-track-thumb, .js-playlist li').removeClass('playing pause');
          }
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
      }).catch(error => { console.log(error); });
    }
  };

  var playAudio = () => {
    playRequest(song);
    tracker.slider('option', 'max', song.duration);
    $('.js-playlist li').removeClass('playing pause');
    $('.js-track-thumb, .js-playlist li.active').addClass('playing').removeClass('pause');
    $('.js-play').addClass('d-none');
    $('.js-pause').addClass('d-flex');
  };

  var stopAudio = () => {
    playRequest(song, true);
    $('.js-track-thumb, .js-playlist li.active').addClass('pause');
    $('.js-play').removeClass('d-none');
    $('.js-pause').removeClass('d-flex');
  };

  $(window).on('load', function () {
    $('body').append($('<script />', { src: 'https://buttons.github.io/buttons.js' }));
    $('.js-github-btn').removeClass('invisible');
    initAudio($('.js-playlist li:first-child'));
    song.volume = 1;
  });
});
