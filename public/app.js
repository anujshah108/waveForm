WaveSurfer.Drawer.MyDrawer = Object.create(WaveSurfer.Drawer.Canvas);
WaveSurfer.util.extend(WaveSurfer.Drawer.MyDrawer, {
  createElements: function () {
     var waveCanvas = this.wrapper.appendChild(
         this.style(document.createElement('canvas'), {
             position: 'absolute',
             zIndex: 1,
             left: 0,
             top: 0,
             bottom: 0
         })
     );
     this.waveCc = waveCanvas.getContext('2d');

     if (this.params.waveColor == 'rainbow') {
        var gradient = this.waveCc.createLinearGradient(0,0,3600,0);

        gradient.addColorStop("0","#d60303");
        gradient.addColorStop("0.142","orange");
        gradient.addColorStop("0.284","yellow");
        gradient.addColorStop("0.426","green");
        gradient.addColorStop("0.568","#3f6cf7");
        gradient.addColorStop("0.71","indigo");
        gradient.addColorStop("0.852","purple");
        gradient.addColorStop("1.0","#b1004c");

       this.params.waveColor = gradient;
     }

     this.progressWave = this.wrapper.appendChild(
         this.style(document.createElement('wave'), {
             position: 'absolute',
             zIndex: 2,
             left: 0,
             top: 0,
             bottom: 0,
             overflow: 'hidden',
             width: '0',
             display: 'none',
             boxSizing: 'border-box',
             borderRightStyle: 'solid',
             borderRightWidth: this.params.cursorWidth + 'px',
             borderRightColor: this.params.cursorColor
         })
     );

     if (this.params.waveColor != this.params.progressColor) {
         var progressCanvas = this.progressWave.appendChild(
             document.createElement('canvas')
         );
         this.progressCc = progressCanvas.getContext('2d');
     }
   },
   drawWave: function (peaks, channelIndex, start, end) {
        var my = this;
        // Split channels
        if (peaks[0] instanceof Array) {
            var channels = peaks;
            if (this.params.splitChannels) {
                this.setHeight(channels.length * this.params.height * this.params.pixelRatio);
                channels.forEach(function(channelPeaks, i) {
                    my.drawWave(channelPeaks, i, start, end);
                });
                return;
            } else {
                peaks = channels[0];
            }
        }

        // Support arrays without negative peaks
        var hasMinValues = [].some.call(peaks, function (val) { return val < 0; });
        if (!hasMinValues) {
            var reflectedPeaks = [];
            for (var i = 0, len = peaks.length; i < len; i++) {
                reflectedPeaks[2 * i] = peaks[i];
                reflectedPeaks[2 * i + 1] = -peaks[i];
            }
            peaks = reflectedPeaks;
        }

        // A half-pixel offset makes lines crisp
        var $ = 0.5 / this.params.pixelRatio;
        var height = this.params.height * this.params.pixelRatio;
        var offsetY = height * channelIndex || 0;
        var halfH = height / 2;
        var length = ~~(peaks.length / 2);

        var scale = 1;
        if (this.params.fillParent && this.width != length) {
            scale = this.width / length;
        }

        var absmax = 1 / this.params.barHeight;
        if (this.params.normalize) {
            var max = WaveSurfer.util.max(peaks);
            var min = WaveSurfer.util.min(peaks);
            absmax = -min > max ? -min : max;
        }

        this.waveCc.fillStyle = this.params.waveColor;
        if (this.progressCc) {
            this.progressCc.fillStyle = this.params.progressColor;
        }

        [ this.waveCc, this.progressCc ].forEach(function (cc) {
            if (!cc) { return; }

            cc.beginPath();
            cc.moveTo(start * scale + $, halfH + offsetY);

            for (var i = start; i < end; i++) {
                var h = Math.round(peaks[2 * i] / absmax * halfH);
                cc.lineTo(i * scale + $, halfH - h + offsetY);
            }

            for (var i = end - 1; i >= start; i--) {
                var h = Math.round(peaks[2 * i + 1] / absmax * halfH);
                cc.lineTo(i * scale + $, halfH - h + offsetY);
            }

            cc.closePath();
            cc.fill();

            // Always draw a median line
            cc.fillRect(0, halfH + offsetY - $, this.width, $);

            cc.fillStyle = 'black';
            var label = document.getElementById('labelwave');
            cc.font = my.params.fontcustom;
            var textWidth = cc.measureText(label.value).width;
            cc.fillText(label.value, (this.width / 2) - (textWidth / 2), height - 50);

        }, this);
    },
});

WaveSurfer.Drawer.Scheme = Object.create(WaveSurfer.Drawer.Canvas);
WaveSurfer.util.extend(WaveSurfer.Drawer.Scheme, {
  createElements: function () {
     var waveCanvas = this.wrapper.appendChild(
         this.style(document.createElement('canvas'), {
             position: 'absolute',
             zIndex: 1,
             left: 0,
             top: 0,
             bottom: 0
         })
     );
     this.waveCc = waveCanvas.getContext('2d');

     this.progressWave = this.wrapper.appendChild(
         this.style(document.createElement('wave'), {
             position: 'absolute',
             zIndex: 2,
             left: 0,
             top: 0,
             bottom: 0,
             overflow: 'hidden',
             width: '0',
             display: 'none',
             boxSizing: 'border-box',
             borderRightStyle: 'solid',
             borderRightWidth: this.params.cursorWidth + 'px',
             borderRightColor: this.params.cursorColor
         })
     );

     if (this.params.waveColor != this.params.progressColor) {
         var progressCanvas = this.progressWave.appendChild(
             document.createElement('canvas')
         );
         this.progressCc = progressCanvas.getContext('2d');
     }
   },
   drawWave: function (peaks, channelIndex, start, end) {
        var my = this;
        // Split channels
        if (peaks[0] instanceof Array) {
            var channels = peaks;
            if (this.params.splitChannels) {
                this.setHeight(channels.length * this.params.height * this.params.pixelRatio);
                channels.forEach(function(channelPeaks, i) {
                    my.drawWave(channelPeaks, i, start, end);
                });
                return;
            } else {
                peaks = channels[0];
            }
        }

        // Support arrays without negative peaks
        var hasMinValues = [].some.call(peaks, function (val) { return val < 0; });
        if (!hasMinValues) {
            var reflectedPeaks = [];
            for (var i = 0, len = peaks.length; i < len; i++) {
                reflectedPeaks[2 * i] = peaks[i];
                reflectedPeaks[2 * i + 1] = -peaks[i];
            }
            peaks = reflectedPeaks;
        }

        // A half-pixel offset makes lines crisp
        var $ = 0.5 / this.params.pixelRatio;
        var height = this.params.height * this.params.pixelRatio;
        var offsetY = height * channelIndex || 0;
        var halfH = height / 2;
        var length = ~~(peaks.length / 2);

        var scale = 1;
        if (this.params.fillParent && this.width != length) {
            scale = this.width / length;
        }

        var absmax = 1 / this.params.barHeight;
        if (this.params.normalize) {
            var max = WaveSurfer.util.max(peaks);
            var min = WaveSurfer.util.min(peaks);
            absmax = -min > max ? -min : max;
        }

        if (this.params.waveColor.length == 0) {
          this.params.waveColor = 'black';
        } else if (this.params.waveColor.length == 1) {
          this.params.waveColor = this.params.waveColor[0];
        } else if (this.params.waveColor.length == 2) {
           var gradient = this.waveCc.createLinearGradient(0,0,3600,0);
           gradient.addColorStop("0",this.params.waveColor[0]);
           gradient.addColorStop("1.0",this.params.waveColor[1]);
           this.params.waveColor = gradient;
        } else if (this.params.waveColor.length == 3) {
          var gradient = this.waveCc.createLinearGradient(0,0,3600,0);
          gradient.addColorStop("0",this.params.waveColor[0]);
          gradient.addColorStop("0.5",this.params.waveColor[1]);
          gradient.addColorStop("1.0",this.params.waveColor[2]);
          this.params.waveColor = gradient;
        } else if (this.params.waveColor.length == 4) {
          var gradient = this.waveCc.createLinearGradient(0,0,3600,0);
          gradient.addColorStop("0",this.params.waveColor[0]);
          gradient.addColorStop("0.35",this.params.waveColor[1]);
          gradient.addColorStop("0.7",this.params.waveColor[2]);
          gradient.addColorStop("1.0",this.params.waveColor[3]);
          this.params.waveColor = gradient;
        } else if (this.params.waveColor.length == 5) {
          var gradient = this.waveCc.createLinearGradient(0,0,3600,0);
          gradient.addColorStop("0",this.params.waveColor[0]);
          gradient.addColorStop("0.25",this.params.waveColor[1]);
          gradient.addColorStop("0.5",this.params.waveColor[2]);
          gradient.addColorStop("0.75",this.params.waveColor[3]);
          gradient.addColorStop("1.0",this.params.waveColor[4]);
          this.params.waveColor = gradient;
        } else if (this.params.waveColor.length == 6) {
          var gradient = this.waveCc.createLinearGradient(0,0,3600,0);
          gradient.addColorStop("0",this.params.waveColor[0]);
          gradient.addColorStop("0.2",this.params.waveColor[1]);
          gradient.addColorStop("0.4",this.params.waveColor[2]);
          gradient.addColorStop("0.6",this.params.waveColor[3]);
          gradient.addColorStop("0.8",this.params.waveColor[4]);
          gradient.addColorStop("1.0",this.params.waveColor[5]);
          this.params.waveColor = gradient;
        }

        this.waveCc.fillStyle = this.params.waveColor;
        if (this.progressCc) {
            this.progressCc.fillStyle = this.params.progressColor;
        }

        [ this.waveCc, this.progressCc ].forEach(function (cc) {
            if (!cc) { return; }

            cc.beginPath();
            cc.moveTo(start * scale + $, halfH + offsetY);

            for (var i = start; i < end; i++) {
                var h = Math.round(peaks[2 * i] / absmax * halfH);
                cc.lineTo(i * scale + $, halfH - h + offsetY);
            }

            for (var i = end - 1; i >= start; i--) {
                var h = Math.round(peaks[2 * i + 1] / absmax * halfH);
                cc.lineTo(i * scale + $, halfH - h + offsetY);
            }

            cc.closePath();
            cc.fill();

            // Always draw a median line
            cc.fillRect(0, halfH + offsetY - $, this.width, $);

            cc.fillStyle = 'black';
            var label = document.getElementById('labelwave');
            cc.font = my.params.fontcustom;
            var textWidth = cc.measureText(label.value).width;
            cc.fillText(label.value, (this.width / 2) - (textWidth / 2), height - 50);
        }, this);
    },
});

var app = new Vue({
  el: '#app-widget',
  data: {
    urlaudio: null,
    label: null,
    wavesurfer: null,
    wavesurferc: null,
    wavesurferscheme: null,
    uploadfile: null,
    loading: false,
    c1: '#dc1000',
    c2: '#ff4500',
    c3: '#fef65b',
    c4: '#bde0af',
    c5: '#00f6ff',
    c6: '#9a7eb8',
    font: '50px Georgia',
    height: 1.111
  },
  mounted () {
    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'black',
      cursorWidth: 0,
      hideScrollbar: true,
      fillParent: true,
      barHeight: this.height,
      height: 600,
      fontcustom: this.font,
      renderer: 'MyDrawer'
    });
    this.wavesurferc = WaveSurfer.create({
      container: '#waveformc',
      waveColor: 'rainbow',
      cursorWidth: 0,
      hideScrollbar: true,
      fillParent: true,
      barHeight: this.height,
      height: 600,
      fontcustom: this.font,
      renderer: 'MyDrawer'
    });

    this.wavesurferscheme = WaveSurfer.create({
      container: '#wavesurferscheme',
      waveColor: [this.c1, this.c2, this.c3, this.c4, this.c5, this.c6],
      cursorWidth: 0,
      hideScrollbar: true,
      fillParent: true,
      barHeight: this.height,
      height: 600,
      fontcustom: this.font,
      renderer: 'Scheme'
    });


  },
  methods: {
    wave: function() {
      this.$http.get('/getaudio?url=' + this.urlaudio).then( function( response ) {
        app.wavesurfer.loadBlob(response.data);
      });
    },
    upload () {
      this.loading = true;
      var myForm = document.getElementById('uploadForm');
      var formData = new FormData(myForm);



      app.wavesurfer.params.fontcustom = this.font;
      app.wavesurferc.params.fontcustom = this.font;
      app.wavesurferscheme.params.fontcustom = this.font;

      app.wavesurfer.params.barHeight = this.height;
      app.wavesurferc.params.barHeight = this.height;
      app.wavesurferscheme.params.barHeight = this.height;

      app.wavesurferscheme.params.waveColor = [];
      if (this.c1 != '') {
        app.wavesurferscheme.params.waveColor.push(this.c1);
      }
      if (this.c2 != '') {
        app.wavesurferscheme.params.waveColor.push(this.c2);
      }
      if (this.c3 != '') {
        app.wavesurferscheme.params.waveColor.push(this.c3);
      }
      if (this.c4 != '') {
        app.wavesurferscheme.params.waveColor.push(this.c4);
      }
      if (this.c5 != '') {
        app.wavesurferscheme.params.waveColor.push(this.c5);
      }
      if (this.c6 != '') {
        app.wavesurferscheme.params.waveColor.push(this.c6);
      }
      this.$http.post('/upload', formData).then( function( response ) {
        app.wavesurfer.loadBlob(response.data);
        app.wavesurferc.loadBlob(response.data);
        app.wavesurferscheme.loadBlob(response.data);
        app.loading = false;
      });
    },
  }
});
