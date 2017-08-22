(function() {
  var CompositeDisposable, SpotifyRemote, exec;

  CompositeDisposable = require('atom').CompositeDisposable;

  exec = require('child_process').exec;

  module.exports = SpotifyRemote = {
    subscriptions: null,
    rawSpotifyData: '',
    nowPlaying: {
      playing: false,
      title: '',
      artist: '',
      album: '',
      toString: function() {
        return (this.playing ? 'Playing' : 'Paused') + ": " + this.artist + " - " + this.title + "  [" + this.album + "]";
      }
    },
    activate: function(state) {
      this.notification = atom.notifications;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'spotify-remote:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'spotify-remote:next': (function(_this) {
          return function() {
            return _this.next();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'spotify-remote:previous': (function(_this) {
          return function() {
            return _this.previous();
          };
        })(this)
      }));
      atom.packages.onDidActivateInitialPackages((function(_this) {
        return function() {
          _this.element = document.createElement('div');
          _this.element.id = 'status-bar-spotify';
          _this.element.classList.add('inline-block');
          _this.statusBar = document.querySelector('status-bar');
          _this.statusBar.addLeftTile({
            item: _this.element,
            priority: 100
          });
          _this.element.innerHTML = "Spotify Now Playing";
          return _this.statusElement = _this.element;
        };
      })(this));
      return setInterval(this.tick.bind(this), 2000);
    },
    deactivate: function() {
      this.modalPanel.destroy();
      this.subscriptions.dispose();
      return this.spotifyRemoteView.destroy();
    },
    toggle: function() {
      return exec('qdbus org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause', (function(_this) {
        return function(e, sout, serr) {
          if (e) {
            _this.notification.addWarning('Spotify may not be running');
          }
          return _this.buildData();
        };
      })(this));
    },
    stop: function() {
      return exec('qdbus org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlaybackStatus', (function(_this) {
        return function(e, sout, serr) {
          if (sout.trim() === 'Playing') {
            return exec('qdbus org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Pause');
          }
        };
      })(this));
    },
    next: function() {
      return exec('qdbus org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next', (function(_this) {
        return function(e, sout) {
          if (e) {
            _this.notification.addWarning('Spotify may not be running');
          }
          return _this.buildData();
        };
      })(this));
    },
    previous: function() {
      return exec('qdbus org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous', (function(_this) {
        return function(e, sout) {
          if (e) {
            _this.notification.addWarning('Spotify may not be running');
          }
          return _this.buildData();
        };
      })(this));
    },
    buildData: function() {
      return exec('qdbus org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Metadata', (function(_this) {
        return function(e, musicData) {
          return exec('qdbus org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlaybackStatus', function(e, playStatus) {
            var album, artist, title;
            _this.rawSpotifyData = musicData.trim();
            if (_this.rawSpotifyData) {
              _this.nowPlaying.playing = playStatus.trim() === 'Playing' ? true : false;
              title = /xesam:title: (.+)/m.exec(_this.rawSpotifyData);
              artist = /xesam:artist: (.+)/m.exec(_this.rawSpotifyData);
              album = /xesam:album: (.+)/m.exec(_this.rawSpotifyData);
              _this.nowPlaying.title = title && title[1] || '';
              _this.nowPlaying.artist = artist && artist[1] || '';
              return _this.nowPlaying.album = album && album[1] || '';
            }
          });
        };
      })(this));
    },
    tick: function() {
      this.buildData();
      if (this.statusElement) {
        return this.statusElement.innerHTML = this.nowPlaying.toString();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Nwb3RpZnktcmVtb3RlL2xpYi9zcG90aWZ5LXJlbW90ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDdkIsT0FBUSxPQUFBLENBQVEsZUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUFpQixhQUFBLEdBQ2Y7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUNBLGNBQUEsRUFBZ0IsRUFEaEI7SUFFQSxVQUFBLEVBQVk7TUFDVixPQUFBLEVBQVMsS0FEQztNQUVWLEtBQUEsRUFBTyxFQUZHO01BR1YsTUFBQSxFQUFRLEVBSEU7TUFJVixLQUFBLEVBQU8sRUFKRztNQUtWLFFBQUEsRUFBVSxTQUFBO2VBQ04sQ0FBSSxJQUFJLENBQUMsT0FBUixHQUFxQixTQUFyQixHQUFvQyxRQUFyQyxDQUFBLEdBQThDLElBQTlDLEdBQW1ELElBQUksQ0FBQyxNQUF4RCxHQUFnRSxLQUFoRSxHQUFzRSxJQUFJLENBQUMsS0FBM0UsR0FBa0YsS0FBbEYsR0FBd0YsSUFBSSxDQUFDLEtBQTdGLEdBQW9HO01BRDlGLENBTEE7S0FGWjtJQVdBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLENBQUM7TUFFckIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUdyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLHVCQUFBLEVBQXlCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENB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QUFBLENBQUEsSUFBQSxDQUE1RztJQURTLENBOURYO0lBNkVBLElBQUEsRUFBTSxTQUFBO01BQ0osSUFBSSxDQUFDLFNBQUwsQ0FBQTtNQUNBLElBQUcsSUFBSSxDQUFDLGFBQVI7ZUFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQW5CLEdBQStCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBaEIsQ0FBQSxFQURqQzs7SUFGSSxDQTdFTjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57ZXhlY30gPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwb3RpZnlSZW1vdGUgPVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIHJhd1Nwb3RpZnlEYXRhOiAnJ1xuICBub3dQbGF5aW5nOiB7XG4gICAgcGxheWluZzogZmFsc2VcbiAgICB0aXRsZTogJydcbiAgICBhcnRpc3Q6ICcnXG4gICAgYWxidW06ICcnXG4gICAgdG9TdHJpbmc6IC0+XG4gICAgICBcIiN7aWYgdGhpcy5wbGF5aW5nIHRoZW4gJ1BsYXlpbmcnIGVsc2UgJ1BhdXNlZCd9OiAjeyB0aGlzLmFydGlzdCB9IC0gI3sgdGhpcy50aXRsZSB9ICBbI3sgdGhpcy5hbGJ1bSB9XVwiXG4gIH1cblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnNcbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3Nwb3RpZnktcmVtb3RlOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnc3BvdGlmeS1yZW1vdGU6bmV4dCc6ID0+IEBuZXh0KClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3Nwb3RpZnktcmVtb3RlOnByZXZpb3VzJzogPT4gQHByZXZpb3VzKClcblxuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyA9PlxuICAgICAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgQGVsZW1lbnQuaWQgPSAnc3RhdHVzLWJhci1zcG90aWZ5J1xuICAgICAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkICdpbmxpbmUtYmxvY2snXG4gICAgICAgIEBzdGF0dXNCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzdGF0dXMtYmFyJylcbiAgICAgICAgQHN0YXR1c0Jhci5hZGRMZWZ0VGlsZShpdGVtOiBAZWxlbWVudCwgcHJpb3JpdHk6IDEwMClcbiAgICAgICAgQGVsZW1lbnQuaW5uZXJIVE1MID0gXCJTcG90aWZ5IE5vdyBQbGF5aW5nXCJcbiAgICAgICAgdGhpcy5zdGF0dXNFbGVtZW50ID0gQGVsZW1lbnRcblxuICAgIHNldEludGVydmFsIEB0aWNrLmJpbmQodGhpcyksIDIwMDBcblxuICAgICNzZXRJbnRlcnZhbCh0aGlzLmJ1aWxkRGF0YS5iaW5kKHRoaXMpLCAyMDAwKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHNwb3RpZnlSZW1vdGVWaWV3LmRlc3Ryb3koKVxuXG4gIHRvZ2dsZTogLT5cbiAgICBleGVjICdxZGJ1cyBvcmcubXByaXMuTWVkaWFQbGF5ZXIyLnNwb3RpZnkgL29yZy9tcHJpcy9NZWRpYVBsYXllcjIgb3JnLm1wcmlzLk1lZGlhUGxheWVyMi5QbGF5ZXIuUGxheVBhdXNlJywgKGUsIHNvdXQsIHNlcnIpID0+XG4gICAgICBpZiBlXG4gICAgICAgIEBub3RpZmljYXRpb24uYWRkV2FybmluZyAnU3BvdGlmeSBtYXkgbm90IGJlIHJ1bm5pbmcnXG4gICAgICB0aGlzLmJ1aWxkRGF0YSgpXG5cbiAgc3RvcDogLT5cbiAgICBleGVjICdxZGJ1cyBvcmcubXByaXMuTWVkaWFQbGF5ZXIyLnNwb3RpZnkgL29yZy9tcHJpcy9NZWRpYVBsYXllcjIgb3JnLm1wcmlzLk1lZGlhUGxheWVyMi5QbGF5ZXIuUGxheWJhY2tTdGF0dXMnLCAoZSwgc291dCwgc2VycikgPT5cbiAgICAgIGlmIHNvdXQudHJpbSgpIGlzICdQbGF5aW5nJ1xuICAgICAgICBleGVjICdxZGJ1cyBvcmcubXByaXMuTWVkaWFQbGF5ZXIyLnNwb3RpZnkgL29yZy9tcHJpcy9NZWRpYVBsYXllcjIgb3JnLm1wcmlzLk1lZGlhUGxheWVyMi5QbGF5ZXIuUGF1c2UnXG5cbiAgbmV4dDogLT5cbiAgICBleGVjICdxZGJ1cyBvcmcubXByaXMuTWVkaWFQbGF5ZXIyLnNwb3RpZnkgL29yZy9tcHJpcy9NZWRpYVBsYXllcjIgb3JnLm1wcmlzLk1lZGlhUGxheWVyMi5QbGF5ZXIuTmV4dCcsIChlLCBzb3V0KSA9PlxuICAgICAgaWYgZVxuICAgICAgICBAbm90aWZpY2F0aW9uLmFkZFdhcm5pbmcgJ1Nwb3RpZnkgbWF5IG5vdCBiZSBydW5uaW5nJ1xuICAgICAgdGhpcy5idWlsZERhdGEoKVxuXG4gIHByZXZpb3VzOiAtPlxuICAgIGV4ZWMgJ3FkYnVzIG9yZy5tcHJpcy5NZWRpYVBsYXllcjIuc3BvdGlmeSAvb3JnL21wcmlzL01lZGlhUGxheWVyMiBvcmcubXByaXMuTWVkaWFQbGF5ZXIyLlBsYXllci5QcmV2aW91cycsIChlLCBzb3V0KSA9PlxuICAgICAgaWYgZVxuICAgICAgICBAbm90aWZpY2F0aW9uLmFkZFdhcm5pbmcgJ1Nwb3RpZnkgbWF5IG5vdCBiZSBydW5uaW5nJ1xuICAgICAgdGhpcy5idWlsZERhdGEoKVxuXG4gIGJ1aWxkRGF0YTogKCkgLT5cbiAgICBleGVjICdxZGJ1cyBvcmcubXByaXMuTWVkaWFQbGF5ZXIyLnNwb3RpZnkgL29yZy9tcHJpcy9NZWRpYVBsYXllcjIgb3JnLm1wcmlzLk1lZGlhUGxheWVyMi5QbGF5ZXIuTWV0YWRhdGEnLCAoZSwgbXVzaWNEYXRhKSA9PlxuICAgICAgZXhlYyAncWRidXMgb3JnLm1wcmlzLk1lZGlhUGxheWVyMi5zcG90aWZ5IC9vcmcvbXByaXMvTWVkaWFQbGF5ZXIyIG9yZy5tcHJpcy5NZWRpYVBsYXllcjIuUGxheWVyLlBsYXliYWNrU3RhdHVzJywgKGUsIHBsYXlTdGF0dXMpID0+XG4gICAgICAgIHRoaXMucmF3U3BvdGlmeURhdGEgPSBtdXNpY0RhdGEudHJpbSgpXG4gICAgICAgIGlmIHRoaXMucmF3U3BvdGlmeURhdGFcbiAgICAgICAgICB0aGlzLm5vd1BsYXlpbmcucGxheWluZyA9IGlmIHBsYXlTdGF0dXMudHJpbSgpIGlzICdQbGF5aW5nJyB0aGVuIHRydWUgZWxzZSBmYWxzZVxuXG4gICAgICAgICAgdGl0bGUgPSAveGVzYW06dGl0bGU6ICguKykvbS5leGVjKHRoaXMucmF3U3BvdGlmeURhdGEpXG4gICAgICAgICAgYXJ0aXN0ID0gL3hlc2FtOmFydGlzdDogKC4rKS9tLmV4ZWModGhpcy5yYXdTcG90aWZ5RGF0YSlcbiAgICAgICAgICBhbGJ1bSA9IC94ZXNhbTphbGJ1bTogKC4rKS9tLmV4ZWModGhpcy5yYXdTcG90aWZ5RGF0YSlcblxuICAgICAgICAgIHRoaXMubm93UGxheWluZy50aXRsZSA9IHRpdGxlICYmIHRpdGxlWzFdIHx8ICcnXG4gICAgICAgICAgdGhpcy5ub3dQbGF5aW5nLmFydGlzdCA9IGFydGlzdCAmJiBhcnRpc3RbMV0gfHwgJydcbiAgICAgICAgICB0aGlzLm5vd1BsYXlpbmcuYWxidW0gPSBhbGJ1bSAmJiBhbGJ1bVsxXSB8fCAnJ1xuXG4gIHRpY2s6IC0+XG4gICAgdGhpcy5idWlsZERhdGEoKVxuICAgIGlmIHRoaXMuc3RhdHVzRWxlbWVudFxuICAgICAgdGhpcy5zdGF0dXNFbGVtZW50LmlubmVySFRNTCA9IHRoaXMubm93UGxheWluZy50b1N0cmluZygpXG4iXX0=
