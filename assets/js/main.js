$.get('assets/json/songs.json', function(data) {
  var song, init = true,
    tracker = $('.tracker'),
    volume = $('.js-volume'),
    randImg = ['avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg', 'avatar-4.jpg', 'avatar-5.jpg', 'avatar-6.jpg', 'avatar-7.jpg'];

  $('.js-playlist-total').text(data.length);

  data.forEach(function(item, index) {
    $('.js-playlist')
      .append('<li class="col-lg-4" title="' + item.title + '" data-url="' + item.url + '"><span class="js-list-song">' + (index + 1) + '. ' + item.title + '</span></li>')
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
    song.addEventListener('timeupdate', function() {
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

    song.addEventListener('ended', function() {
      var next = $('.js-playlist li.active').next();
      if ($('.js-loop-one').hasClass('looped')) {
        song.currentTime = 0;
        song.play();
        return;
      }

      if ($('.js-loop-all').hasClass('looped')) {
        if (next.length == 0) {
          next = $('.js-playlist li:first-child');
        }
        initAudio(next);
        song.addEventListener('loadedmetadata', function() {
          playAudio();
        });
      } else {
        $('.js-track-thumb').removeClass('play');
        return;
      }
    }, false);

    $('.js-playlist li').removeClass('active');
    elem.addClass('active');
  }

  function playAudio() {
    song.play();
    tracker.slider('option', 'max', song.duration);
    $('.js-play').addClass('d-none');
    $('.js-pause').addClass('d-block');
  }

  function stopAudio() {
    song.pause();
    $('.js-play').removeClass('d-none');
    $('.js-pause').removeClass('d-block');
  }

  $('.js-play').on('click', function(e) {
    e.preventDefault();
    $('.js-track-thumb').addClass('play');
    tracker.slider('option', 'max', song.duration);
    song.play();
    $('.js-play').addClass('d-none');
    $('.js-pause').addClass('d-block');
  });

  $('.js-pause').on('click', function(e) {
    e.preventDefault();
    stopAudio();
    $('.js-track-thumb').removeClass('play');
  });

  $('.js-next').click(function(e) {
    e.preventDefault();
    stopAudio();
    init = false;
    var next = $('.js-playlist li.active').next();
    if (next.length === 0) {
      next = $('.js-playlist li:first-child');
    }
    initAudio(next);
    song.addEventListener('loadedmetadata', function() {
      playAudio();
      $('.js-track-thumb').addClass('play');
    });
  });

  $('.js-prev').click(function(e) {
    e.preventDefault();
    stopAudio();
    init = false;
    var prev = $('.js-playlist li.active').prev();
    if (prev.length === 0) {
      prev = $('.js-playlist li:last-child');
    }
    initAudio(prev);
    song.addEventListener('loadedmetadata', function() {
      playAudio();
      $('.js-track-thumb').addClass('play');
    });
  });

  $('.js-list-song').on('click', function() {
    stopAudio();
    initAudio($(this).parent());
    init = false;
    song.addEventListener('loadedmetadata', function() {
      playAudio();
      $('.js-track-thumb').addClass('play');
    });
  });

  song.volume = 0.8;
  volume.slider({
    orientation: 'vertical',
    range: 'max',
    max: 100,
    min: 1,
    value: 100,
    slide: function(event, ui) {
      song.volume = ui.value / 100;
    }
  });

  tracker.slider({
    range: 'min',
    min: 0,
    max: 10,
    slide: function(event, ui) {
      song.currentTime = ui.value;
    }
  });

  $('.js-volume-toggle').on('click', function(e) {
    e.stopPropagation();
    $('.js-volume').toggleClass('show');
  });

  $('.js-volume, .js-dropdown-menu-timer').on('click', function(e) {
    e.stopPropagation();
  });

  $('body').on('click', function() {
    $('.js-volume').removeClass('show');
  });

  $('.js-loop-one, .js-loop-all').on('click', function() {
    $(this).toggleClass('looped');
  });

  $('.js-timer').each(function() {
    var min = parseInt($(this).attr('data-minute'));
    $(this).on('change', function() {
      if ($(this).is(':checked') && min !== 0) {
        setTimeout(function() {
          stopAudio();
        }, min);
      }
    });
  });
});
