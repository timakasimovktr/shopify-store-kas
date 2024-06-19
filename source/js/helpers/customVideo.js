export default class CustomVideo {

  /**
  *   Default Options
  */

    options = {};

    config = {
      youtubeAPI: '//www.youtube.com/iframe_api',
      vimeoAPI: '//player.vimeo.com/api/player.js'
    };

    defaultOptions = {
      element: 'undefined',
      videoType: 'youtube',
      videoId: 'undefined',
      autoplay: true,
      controls: true,
      apiHost: '',
      requestHost: '',
      height: '100%',
      width: '100%',
      onLoad: function() {},
      onStart: function() {},
      onPause: function() {},
      onFinish: function() {},
    };

    player = {};

  constructor(params) {
    this.init(params);
  }

  init(params) {
    var self = this;
    this.isOnceInited = false;
    this.options = $.extend( {}, this.defaultOptions, params );
    if ((this.options.videoId != 'undefined') && (this.element != 'undefined')) {
      /*  Option Init   */
        switch (this.options.videoType) {
          case 'youtube':
            this.options.apiHost = this.config.youtubeAPI
          break;
          case 'vimeo':
            this.options.apiHost = this.config.vimeoAPI
          break;
        }

        this._loadScript(this.options.apiHost, function() {self.preparePlayer()});
    }
  }

  preparePlayer() {
    var self = this;
    switch (this.options.videoType) {
      case 'youtube':
        this.youtubeInit();
      break;
      case 'vimeo':
        this.vimeoInit();
      break;
    }
  }

  _loadScript(url, callback) {
    var script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = callback;
    // script.onerror = reject;
    script.async = true;
    script.src = url;
  }

  youtubeInit() {
    var self = this;
    self._checkYoutubeAPI(function() {
      self.options.controls = (self.options.controls == true) ? 1 : 0;
      self.player = new YT.Player(self.options.element, {
        videoId: self.options.videoId,
        playerVars: {
          showinfo: 0,
          controls: self.options.controls,
          fs: 0,
          rel: 1,
          height: '100%',
          width: '100%',
          iv_load_policy: 3,
          html5: 0,
          loop: 1,
          playsinline: 0,
          modestbranding: 0,
          disablekb: 1,
          origin: self.options.requestHost,
          ecver: 2
        },
        events: {
          onReady: function(e) {self._youtubeReady(e)},
          onStateChange: function(e) {self._youtubeStateChange(e)}
        }
      });
    })
  }
    /* functions of Youtube.. */

      _checkYoutubeAPI(callback) {
        var playerLoadingInterval = setInterval(function () {
          if (typeof window.YT != 'undefined') {
            if (typeof window.YT.Player != 'undefined') {
              clearInterval(playerLoadingInterval);
              callback();
            }
          }
        }, 50);
      }

      _youtubeReady(event) {
        this.player.stopVideo();
        this.options.onLoad();
      }

      _youtubeStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
          this.options.onStart();
        }
        if (event.data === YT.PlayerState.PAUSED) {
          this.options.onPause();
        }
        if (event.data === YT.PlayerState.ENDED) {
          this.options.onFinish();
        }
      }

  vimeoInit() {
    var self = this;
    this.player = new Vimeo.Player(this.options.element, {
      id: this.options.videoId,
      autoplay: true,
      muted: false,
      background: true,
      /*height: '100%',
      width: '100%',*/
      loop: false
    });
    this.player.pause();
    this.player.setCurrentTime(0);
    this.player.on('loaded', function(data) {self._vimeoReady(data)});
    this.player.on('play', function(data) {self._vimeoPlayed(data)});
    this.player.on('pause', function(data) {self._vimeoPaused(data)});
    this.player.on('ended', function(data) {self._vimeoEnded(data)});
    this.player.on('timeupdate', function(data) {self._vimeoStateChange(data)});
  }

    /* functions of Vimeo */
      _vimeoReady(data) {
        // console.log('loaded vimeo');
        this.options.onLoad();
      }
      _vimeoPlayed(data) {
        // console.log('started vimeo');
        this.options.onStart();
      }
      _vimeoPaused(data) {
        // console.log('Paused vimeo');
        this.options.onPause();
      }
      _vimeoEnded(data) {
        // console.log('Ended vimeo');
        this.options.onFinish();
      }
      _vimeoStateChange(data) {
        // console.log(data);
      }

  /*public*/

  play() {
    var self = this;
    switch (self.options.videoType) {
      case 'youtube':
        self.player.playVideo();
      break;
      case 'vimeo':
        self.player.setVolume(0.5);
        self.player.play();
        // self.options.onPlay();
      break;
    }
  }
  pause() {
    var self = this;
    switch (self.options.videoType) {
      case 'youtube':
        self.player.pauseVideo();
      break;
      case 'vimeo':
        self.player.pause().then(function() {
          self.options.onPause();
        });
      break;
    }
  }
}