/* eslint-disable */
function Caman() {
  var $,
    Analyze,
    Blender,
    Calculate,
    Caman,
    CamanParser,
    Canvas,
    Convert,
    Event,
    Fiber,
    Filter,
    IO,
    Image,
    Layer,
    Log,
    Logger,
    PixelInfo,
    Plugin,
    Renderer,
    Root,
    Store,
    Util,
    fs,
    slice,
    __hasProp = {}.hasOwnProperty,
    __indexOf =
      [].indexOf ||
      function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (i in this && this[i] === item) return i;
        }
        return -1;
      },
    __slice = [].slice,
    _this = this;

  slice = Array.prototype.slice;

  $ = function (sel, root) {
    if (root == null) {
      root = document;
    }
    if (
      typeof sel === 'object' ||
      (typeof exports !== 'undefined' && exports !== null)
    ) {
      return sel;
    }
    return root.querySelector(sel);
  };

  Util = (function () {
    function Util() {}

    Util.uniqid = (function () {
      var id;
      id = 0;
      return {
        get: function () {
          return id++;
        }
      };
    })();

    Util.extend = function (obj) {
      var copy, dest, prop, src, _i, _len;
      dest = obj;
      src = slice.call(arguments, 1);
      for (_i = 0, _len = src.length; _i < _len; _i++) {
        copy = src[_i];
        for (prop in copy) {
          if (!__hasProp.call(copy, prop)) continue;
          dest[prop] = copy[prop];
        }
      }
      return dest;
    };

    Util.clampRGB = function (val) {
      if (val < 0) {
        return 0;
      }
      if (val > 255) {
        return 255;
      }
      return val;
    };

    Util.copyAttributes = function (from, to, opts) {
      var attr, _i, _len, _ref, _ref1, _results;
      if (opts == null) {
        opts = {};
      }
      _ref = from.attributes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        if (
          opts.except != null &&
          ((_ref1 = attr.nodeName), __indexOf.call(opts.except, _ref1) >= 0)
        ) {
          continue;
        }
        _results.push(to.setAttribute(attr.nodeName, attr.nodeValue));
      }
      return _results;
    };

    Util.dataArray = function (length) {
      if (length == null) {
        length = 0;
      }
      if (Caman.NodeJS || window.Uint8Array != null) {
        return new Uint8Array(length);
      }
      return new Array(length);
    };

    return Util;
  })();

  if (typeof exports !== 'undefined' && exports !== null) {
    Root = exports;
    Canvas = require('canvas');
    Image = Canvas.Image;
    Fiber = require('fibers');
    fs = require('fs');
  } else {
    Root = window;
  }

  Root.Caman = Caman = (function () {
    Caman.version = {
      release: '4.1.1',
      date: '4/8/2013'
    };

    Caman.DEBUG = false;

    Caman.NodeJS = typeof exports !== 'undefined' && exports !== null;

    Caman.autoload = !Caman.NodeJS;

    Caman.allowRevert = true;

    Caman.crossOrigin = 'anonymous';

    Caman.toString = function () {
      return (
        'Version ' + Caman.version.release + ', Released ' + Caman.version.date
      );
    };

    Caman.remoteProxy = '';

    Caman.proxyParam = 'camanProxyUrl';

    Caman.getAttrId = function (canvas) {
      if (Caman.NodeJS) {
        return true;
      }
      if (typeof canvas === 'string') {
        canvas = $(canvas);
      }
      if (!(canvas != null && canvas.getAttribute != null)) {
        return null;
      }
      return canvas.getAttribute('data-caman-id');
    };

    function Caman() {
      var args,
        callback,
        id,
        _this = this;
      if (arguments.length === 0) {
        throw 'Invalid arguments';
      }
      if (this instanceof Caman) {
        this.finishInit = this.finishInit.bind(this);
        this.imageLoaded = this.imageLoaded.bind(this);
        args = arguments[0];
        if (!Caman.NodeJS) {
          id = parseInt(Caman.getAttrId(args[0]), 10);
          callback =
            typeof args[1] === 'function'
              ? args[1]
              : typeof args[2] === 'function'
              ? args[2]
              : function () {};
          if (!isNaN(id) && Store.has(id)) {
            return Store.execute(id, callback);
          }
        }
        this.id = Util.uniqid.get();
        this.initializedPixelData = this.originalPixelData = null;
        this.cropCoordinates = {
          x: 0,
          y: 0
        };
        this.cropped = false;
        this.resized = false;
        this.pixelStack = [];
        this.layerStack = [];
        this.canvasQueue = [];
        this.currentLayer = null;
        this.scaled = false;
        this.analyze = new Analyze(this);
        this.renderer = new Renderer(this);
        this.domIsLoaded(function () {
          _this.parseArguments(args);
          return _this.setup();
        });
        return this;
      } else {
        return new Caman(arguments);
      }
    }

    Caman.prototype.domIsLoaded = function (cb) {
      var listener,
        _this = this;
      if (Caman.NodeJS) {
        return setTimeout(function () {
          return cb.call(_this);
        }, 0);
      } else {
        if (document.readyState === 'complete') {
          Log.debug('DOM initialized');
          return setTimeout(function () {
            return cb.call(_this);
          }, 0);
        } else {
          listener = function () {
            if (document.readyState === 'complete') {
              Log.debug('DOM initialized');
              return cb.call(_this);
            }
          };
          return document.addEventListener('readystatechange', listener, false);
        }
      }
    };

    Caman.prototype.parseArguments = function (args) {
      var key, val, _ref, _results;
      if (args.length === 0) {
        throw 'Invalid arguments given';
      }
      this.initObj = null;
      this.initType = null;
      this.imageUrl = null;
      this.callback = function () {};
      this.setInitObject(args[0]);
      if (args.length === 1) {
        return;
      }
      switch (typeof args[1]) {
        case 'string':
          this.imageUrl = args[1];
          break;
        case 'function':
          this.callback = args[1];
      }
      if (args.length === 2) {
        return;
      }
      this.callback = args[2];
      if (args.length === 4) {
        _ref = args[4];
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          _results.push((this.options[key] = val));
        }
        return _results;
      }
    };

    Caman.prototype.setInitObject = function (obj) {
      if (Caman.NodeJS) {
        this.initObj = obj;
        this.initType = 'node';
        return;
      }
      if (typeof obj === 'object') {
        this.initObj = obj;
      } else {
        this.initObj = $(obj);
      }
      if (this.initObj == null) {
        throw 'Could not find image or canvas for initialization.';
      }
      return (this.initType = this.initObj.nodeName.toLowerCase());
    };

    Caman.prototype.setup = function () {
      switch (this.initType) {
        case 'node':
          return this.initNode();
        case 'img':
          return this.initImage();
        case 'canvas':
          return this.initCanvas();
      }
    };

    Caman.prototype.initNode = function () {
      var _this = this;
      Log.debug('Initializing for NodeJS');
      this.image = new Image();
      this.image.onload = function () {
        Log.debug(
          'Image loaded. Width = ' +
            _this.imageWidth() +
            ', Height = ' +
            _this.imageHeight()
        );
        _this.canvas = new Canvas(_this.imageWidth(), _this.imageHeight());
        return _this.finishInit();
      };
      this.image.onerror = function (err) {
        throw err;
      };
      return (this.image.src = this.initObj);
    };

    Caman.prototype.initImage = function () {
      this.image = this.initObj;
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      Util.copyAttributes(this.image, this.canvas, {
        except: ['src']
      });
      this.image.parentNode.replaceChild(this.canvas, this.image);
      this.imageAdjustments();
      return this.waitForImageLoaded();
    };

    Caman.prototype.initCanvas = function () {
      this.canvas = this.initObj;
      this.context = this.canvas.getContext('2d');
      if (this.imageUrl != null) {
        this.image = document.createElement('img');
        this.image.src = this.imageUrl;
        this.imageAdjustments();
        return this.waitForImageLoaded();
      } else {
        return this.finishInit();
      }
    };

    Caman.prototype.imageAdjustments = function () {
      if (this.needsHiDPISwap()) {
        Log.debug(this.image.src, '->', this.hiDPIReplacement());
        this.swapped = true;
        this.image.src = this.hiDPIReplacement();
      }
      if (IO.isRemote(this.image)) {
        this.image.src = IO.proxyUrl(this.image.src);
        return Log.debug(
          'Remote image detected, using URL = ' + this.image.src
        );
      }
    };

    Caman.prototype.waitForImageLoaded = function () {
      if (this.isImageLoaded()) {
        return this.imageLoaded();
      } else {
        return (this.image.onload = this.imageLoaded);
      }
    };

    Caman.prototype.isImageLoaded = function () {
      if (!this.image.complete) {
        return false;
      }
      if (this.image.naturalWidth != null && this.image.naturalWidth === 0) {
        return false;
      }
      return true;
    };

    Caman.prototype.imageWidth = function () {
      return this.image.width || this.image.naturalWidth;
    };

    Caman.prototype.imageHeight = function () {
      return this.image.height || this.image.naturalHeight;
    };

    Caman.prototype.imageLoaded = function () {
      Log.debug(
        'Image loaded. Width = ' +
          this.imageWidth() +
          ', Height = ' +
          this.imageHeight()
      );
      if (this.swapped) {
        this.canvas.width = this.imageWidth() / this.hiDPIRatio();
        this.canvas.height = this.imageHeight() / this.hiDPIRatio();
      } else {
        this.canvas.width = this.imageWidth();
        this.canvas.height = this.imageHeight();
      }
      return this.finishInit();
    };

    Caman.prototype.finishInit = function () {
      var i, pixel, _i, _len, _ref;
      if (this.context == null) {
        this.context = this.canvas.getContext('2d');
      }
      this.originalWidth = this.preScaledWidth = this.width = this.canvas.width;
      this.originalHeight =
        this.preScaledHeight =
        this.height =
          this.canvas.height;
      this.hiDPIAdjustments();
      if (!this.hasId()) {
        this.assignId();
      }
      if (this.image != null) {
        this.context.drawImage(
          this.image,
          0,
          0,
          this.imageWidth(),
          this.imageHeight(),
          0,
          0,
          this.preScaledWidth,
          this.preScaledHeight
        );
      }
      this.reloadCanvasData();
      if (Caman.allowRevert) {
        this.initializedPixelData = Util.dataArray(this.pixelData.length);
        this.originalPixelData = Util.dataArray(this.pixelData.length);
        _ref = this.pixelData;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          pixel = _ref[i];
          this.initializedPixelData[i] = pixel;
          this.originalPixelData[i] = pixel;
        }
      }
      this.dimensions = {
        width: this.canvas.width,
        height: this.canvas.height
      };
      Store.put(this.id, this);
      this.callback.call(this, this);
      return (this.callback = function () {});
    };

    Caman.prototype.reloadCanvasData = function () {
      this.imageData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      return (this.pixelData = this.imageData.data);
    };

    Caman.prototype.resetOriginalPixelData = function () {
      var pixel, _i, _len, _ref, _results;
      if (!Caman.allowRevert) {
        throw 'Revert disabled';
      }
      this.originalPixelData = Util.dataArray(this.pixelData.length);
      _ref = this.pixelData;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pixel = _ref[_i];
        _results.push(this.originalPixelData.push(pixel));
      }
      return _results;
    };

    Caman.prototype.hasId = function () {
      return Caman.getAttrId(this.canvas) != null;
    };

    Caman.prototype.assignId = function () {
      if (Caman.NodeJS || this.canvas.getAttribute('data-caman-id')) {
        return;
      }
      return this.canvas.setAttribute('data-caman-id', this.id);
    };

    Caman.prototype.hiDPIDisabled = function () {
      return this.canvas.getAttribute('data-caman-hidpi-disabled') !== null;
    };

    Caman.prototype.hiDPIAdjustments = function () {
      var ratio;
      if (Caman.NodeJS || this.hiDPIDisabled()) {
        return;
      }
      ratio = this.hiDPIRatio();
      if (ratio !== 1) {
        Log.debug('HiDPI ratio = ' + ratio);
        this.scaled = true;
        this.preScaledWidth = this.canvas.width;
        this.preScaledHeight = this.canvas.height;
        this.canvas.width = this.preScaledWidth * ratio;
        this.canvas.height = this.preScaledHeight * ratio;
        this.canvas.style.width = '' + this.preScaledWidth + 'px';
        this.canvas.style.height = '' + this.preScaledHeight + 'px';
        this.context.scale(ratio, ratio);
        this.width = this.originalWidth = this.canvas.width;
        return (this.height = this.originalHeight = this.canvas.height);
      }
    };

    Caman.prototype.hiDPIRatio = function () {
      var backingStoreRatio, devicePixelRatio;
      devicePixelRatio = window.devicePixelRatio || 1;
      backingStoreRatio =
        this.context.webkitBackingStorePixelRatio ||
        this.context.mozBackingStorePixelRatio ||
        this.context.msBackingStorePixelRatio ||
        this.context.oBackingStorePixelRatio ||
        this.context.backingStorePixelRatio ||
        1;
      return devicePixelRatio / backingStoreRatio;
    };

    Caman.prototype.hiDPICapable = function () {
      return window.devicePixelRatio != null && window.devicePixelRatio !== 1;
    };

    Caman.prototype.needsHiDPISwap = function () {
      if (this.hiDPIDisabled() || !this.hiDPICapable()) {
        return false;
      }
      return this.hiDPIReplacement() !== null;
    };

    Caman.prototype.hiDPIReplacement = function () {
      if (this.image == null) {
        return null;
      }
      return this.image.getAttribute('data-caman-hidpi');
    };

    Caman.prototype.replaceCanvas = function (newCanvas) {
      var oldCanvas;
      oldCanvas = this.canvas;
      this.canvas = newCanvas;
      this.context = this.canvas.getContext('2d');
      oldCanvas.parentNode.replaceChild(this.canvas, oldCanvas);
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.reloadCanvasData();
      return (this.dimensions = {
        width: this.canvas.width,
        height: this.canvas.height
      });
    };

    Caman.prototype.render = function (callback) {
      var _this = this;
      if (callback == null) {
        callback = function () {};
      }
      Event.trigger(this, 'renderStart');
      return this.renderer.execute(function () {
        _this.context.putImageData(_this.imageData, 0, 0);
        return callback.call(_this);
      });
    };

    Caman.prototype.revert = function () {
      var i, pixel, _i, _len, _ref;
      if (!Caman.allowRevert) {
        throw 'Revert disabled';
      }
      _ref = this.originalVisiblePixels();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        pixel = _ref[i];
        this.pixelData[i] = pixel;
      }
      return this.context.putImageData(this.imageData, 0, 0);
    };

    Caman.prototype.reset = function () {
      var canvas, ctx, i, imageData, pixel, pixelData, _i, _len, _ref;
      canvas = document.createElement('canvas');
      Util.copyAttributes(this.canvas, canvas);
      canvas.width = this.originalWidth;
      canvas.height = this.originalHeight;
      ctx = canvas.getContext('2d');
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      pixelData = imageData.data;
      _ref = this.initializedPixelData;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        pixel = _ref[i];
        pixelData[i] = pixel;
      }
      ctx.putImageData(imageData, 0, 0);
      this.cropCoordinates = {
        x: 0,
        y: 0
      };
      this.resized = false;
      return this.replaceCanvas(canvas);
    };

    Caman.prototype.originalVisiblePixels = function () {
      var canvas,
        coord,
        ctx,
        endX,
        endY,
        i,
        imageData,
        pixel,
        pixelData,
        pixels,
        scaledCanvas,
        startX,
        startY,
        width,
        _i,
        _j,
        _len,
        _ref,
        _ref1,
        _ref2,
        _ref3;
      if (!Caman.allowRevert) {
        throw 'Revert disabled';
      }
      pixels = [];
      startX = this.cropCoordinates.x;
      endX = startX + this.width;
      startY = this.cropCoordinates.y;
      endY = startY + this.height;
      if (this.resized) {
        canvas = document.createElement('canvas');
        canvas.width = this.originalWidth;
        canvas.height = this.originalHeight;
        ctx = canvas.getContext('2d');
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pixelData = imageData.data;
        _ref = this.originalPixelData;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          pixel = _ref[i];
          pixelData[i] = pixel;
        }
        ctx.putImageData(imageData, 0, 0);
        scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = this.width;
        scaledCanvas.height = this.height;
        ctx = scaledCanvas.getContext('2d');
        ctx.drawImage(
          canvas,
          0,
          0,
          this.originalWidth,
          this.originalHeight,
          0,
          0,
          this.width,
          this.height
        );
        pixelData = ctx.getImageData(0, 0, this.width, this.height).data;
        width = this.width;
      } else {
        pixelData = this.originalPixelData;
        width = this.originalWidth;
      }
      for (i = _j = 0, _ref1 = pixelData.length; _j < _ref1; i = _j += 4) {
        coord = PixelInfo.locationToCoordinates(i, width);
        if (
          startX <= (_ref2 = coord.x) &&
          _ref2 < endX &&
          startY <= (_ref3 = coord.y) &&
          _ref3 < endY
        ) {
          pixels.push(
            pixelData[i],
            pixelData[i + 1],
            pixelData[i + 2],
            pixelData[i + 3]
          );
        }
      }
      return pixels;
    };

    Caman.prototype.process = function (name, processFn) {
      this.renderer.add({
        type: Filter.Type.Single,
        name: name,
        processFn: processFn
      });
      return this;
    };

    Caman.prototype.processKernel = function (name, adjust, divisor, bias) {
      var i, _i, _ref;
      if (!divisor) {
        divisor = 0;
        for (
          i = _i = 0, _ref = adjust.length;
          0 <= _ref ? _i < _ref : _i > _ref;
          i = 0 <= _ref ? ++_i : --_i
        ) {
          divisor += adjust[i];
        }
      }
      this.renderer.add({
        type: Filter.Type.Kernel,
        name: name,
        adjust: adjust,
        divisor: divisor,
        bias: bias || 0
      });
      return this;
    };

    Caman.prototype.processPlugin = function (plugin, args) {
      this.renderer.add({
        type: Filter.Type.Plugin,
        plugin: plugin,
        args: args
      });
      return this;
    };

    Caman.prototype.newLayer = function (callback) {
      var layer;
      layer = new Layer(this);
      this.canvasQueue.push(layer);
      this.renderer.add({
        type: Filter.Type.LayerDequeue
      });
      callback.call(layer);
      this.renderer.add({
        type: Filter.Type.LayerFinished
      });
      return this;
    };

    Caman.prototype.executeLayer = function (layer) {
      return this.pushContext(layer);
    };

    Caman.prototype.pushContext = function (layer) {
      this.layerStack.push(this.currentLayer);
      this.pixelStack.push(this.pixelData);
      this.currentLayer = layer;
      return (this.pixelData = layer.pixelData);
    };

    Caman.prototype.popContext = function () {
      this.pixelData = this.pixelStack.pop();
      return (this.currentLayer = this.layerStack.pop());
    };

    Caman.prototype.applyCurrentLayer = function () {
      return this.currentLayer.applyToParent();
    };

    return Caman;
  })();

  Analyze = (function () {
    function Analyze(c) {
      this.c = c;
    }

    Analyze.prototype.calculateLevels = function () {
      var i, levels, numPixels, _i, _j, _k, _ref;
      levels = {
        r: {},
        g: {},
        b: {}
      };
      for (i = _i = 0; _i <= 255; i = ++_i) {
        levels.r[i] = 0;
        levels.g[i] = 0;
        levels.b[i] = 0;
      }
      for (i = _j = 0, _ref = this.c.pixelData.length; _j < _ref; i = _j += 4) {
        levels.r[this.c.pixelData[i]]++;
        levels.g[this.c.pixelData[i + 1]]++;
        levels.b[this.c.pixelData[i + 2]]++;
      }
      numPixels = this.c.pixelData.length / 4;
      for (i = _k = 0; _k <= 255; i = ++_k) {
        levels.r[i] /= numPixels;
        levels.g[i] /= numPixels;
        levels.b[i] /= numPixels;
      }
      return levels;
    };

    return Analyze;
  })();

  Caman.DOMUpdated = function () {
    var img, imgs, parser, _i, _len, _results;
    imgs = document.querySelectorAll('img[data-caman]');
    if (!(imgs.length > 0)) {
      return;
    }
    _results = [];
    for (_i = 0, _len = imgs.length; _i < _len; _i++) {
      img = imgs[_i];
      _results.push(
        (parser = new CamanParser(img, function () {
          this.parse();
          return this.execute();
        }))
      );
    }
    return _results;
  };

  if (Caman.autoload) {
    (function () {
      if (document.readyState === 'complete') {
        return Caman.DOMUpdated();
      } else {
        return document.addEventListener(
          'DOMContentLoaded',
          Caman.DOMUpdated,
          false
        );
      }
    })();
  }

  CamanParser = (function () {
    var INST_REGEX;

    INST_REGEX = '(\\w+)\\((.*?)\\)';

    function CamanParser(ele, ready) {
      this.dataStr = ele.getAttribute('data-caman');
      this.caman = Caman(ele, ready.bind(this));
    }

    CamanParser.prototype.parse = function () {
      var args,
        filter,
        func,
        inst,
        instFunc,
        m,
        r,
        unparsedInstructions,
        _i,
        _len,
        _ref,
        _results;
      this.ele = this.caman.canvas;
      r = new RegExp(INST_REGEX, 'g');
      unparsedInstructions = this.dataStr.match(r);
      if (!(unparsedInstructions.length > 0)) {
        return;
      }
      r = new RegExp(INST_REGEX);
      _results = [];
      for (_i = 0, _len = unparsedInstructions.length; _i < _len; _i++) {
        inst = unparsedInstructions[_i];
        (_ref = inst.match(r)),
          (m = _ref[0]),
          (filter = _ref[1]),
          (args = _ref[2]);
        instFunc = new Function(
          'return function() {        this.' +
            filter +
            '(' +
            args +
            ');      };'
        );
        try {
          func = instFunc();
          _results.push(func.call(this.caman));
        } catch (e) {
          _results.push(Log.debug(e));
        }
      }
      return _results;
    };

    CamanParser.prototype.execute = function () {
      var ele;
      ele = this.ele;
      return this.caman.render(function () {
        return ele.parentNode.replaceChild(this.toImage(), ele);
      });
    };

    return CamanParser;
  })();

  Caman.Blender = Blender = (function () {
    function Blender() {}

    Blender.blenders = {};

    Blender.register = function (name, func) {
      return (this.blenders[name] = func);
    };

    Blender.execute = function (name, rgbaLayer, rgbaParent) {
      return this.blenders[name](rgbaLayer, rgbaParent);
    };

    return Blender;
  })();

  Caman.Calculate = Calculate = (function () {
    function Calculate() {}

    Calculate.distance = function (x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    Calculate.randomRange = function (min, max, getFloat) {
      var rand;
      if (getFloat == null) {
        getFloat = false;
      }
      rand = min + Math.random() * (max - min);
      if (getFloat) {
        return rand.toFixed(getFloat);
      } else {
        return Math.round(rand);
      }
    };

    Calculate.luminance = function (rgba) {
      return 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
    };

    Calculate.bezier = function (
      start,
      ctrl1,
      ctrl2,
      end,
      lowBound,
      highBound
    ) {
      var Ax,
        Ay,
        Bx,
        By,
        Cx,
        Cy,
        bezier,
        curveX,
        curveY,
        i,
        j,
        leftCoord,
        rightCoord,
        t,
        x0,
        x1,
        x2,
        x3,
        y0,
        y1,
        y2,
        y3,
        _i,
        _j,
        _k,
        _ref,
        _ref1;
      x0 = start[0];
      y0 = start[1];
      x1 = ctrl1[0];
      y1 = ctrl1[1];
      x2 = ctrl2[0];
      y2 = ctrl2[1];
      x3 = end[0];
      y3 = end[1];
      bezier = {};
      Cx = parseInt(3 * (x1 - x0), 10);
      Bx = 3 * (x2 - x1) - Cx;
      Ax = x3 - x0 - Cx - Bx;
      Cy = 3 * (y1 - y0);
      By = 3 * (y2 - y1) - Cy;
      Ay = y3 - y0 - Cy - By;
      for (i = _i = 0; _i < 1000; i = ++_i) {
        t = i / 1000;
        curveX = Math.round(
          Ax * Math.pow(t, 3) + Bx * Math.pow(t, 2) + Cx * t + x0
        );
        curveY = Math.round(
          Ay * Math.pow(t, 3) + By * Math.pow(t, 2) + Cy * t + y0
        );
        if (lowBound && curveY < lowBound) {
          curveY = lowBound;
        } else if (highBound && curveY > highBound) {
          curveY = highBound;
        }
        bezier[curveX] = curveY;
      }
      if (bezier.length < end[0] + 1) {
        for (
          i = _j = 0, _ref = end[0];
          0 <= _ref ? _j <= _ref : _j >= _ref;
          i = 0 <= _ref ? ++_j : --_j
        ) {
          if (bezier[i] == null) {
            leftCoord = [i - 1, bezier[i - 1]];
            for (
              j = _k = i, _ref1 = end[0];
              i <= _ref1 ? _k <= _ref1 : _k >= _ref1;
              j = i <= _ref1 ? ++_k : --_k
            ) {
              if (bezier[j] != null) {
                rightCoord = [j, bezier[j]];
                break;
              }
            }
            bezier[i] =
              leftCoord[1] +
              ((rightCoord[1] - leftCoord[1]) /
                (rightCoord[0] - leftCoord[0])) *
                (i - leftCoord[0]);
          }
        }
      }
      if (bezier[end[0]] == null) {
        bezier[end[0]] = bezier[end[0] - 1];
      }
      return bezier;
    };

    return Calculate;
  })();

  Convert = (function () {
    function Convert() {}

    Convert.hexToRGB = function (hex) {
      var b, g, r;
      if (hex.charAt(0) === '#') {
        hex = hex.substr(1);
      }
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
      return {
        r: r,
        g: g,
        b: b
      };
    };

    Convert.rgbToHSL = function (r, g, b) {
      var d, h, l, max, min, s;
      if (typeof r === 'object') {
        g = r.g;
        b = r.b;
        r = r.r;
      }
      r /= 255;
      g /= 255;
      b /= 255;
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = (function () {
          switch (max) {
            case r:
              return (g - b) / d + (g < b ? 6 : 0);
            case g:
              return (b - r) / d + 2;
            case b:
              return (r - g) / d + 4;
          }
        })();
        h /= 6;
      }
      return {
        h: h,
        s: s,
        l: l
      };
    };

    Convert.hslToRGB = function (h, s, l) {
      var b, g, p, q, r;
      if (typeof h === 'object') {
        s = h.s;
        l = h.l;
        h = h.h;
      }
      if (s === 0) {
        r = g = b = l;
      } else {
        q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;
        r = this.hueToRGB(p, q, h + 1 / 3);
        g = this.hueToRGB(p, q, h);
        b = this.hueToRGB(p, q, h - 1 / 3);
      }
      return {
        r: r * 255,
        g: g * 255,
        b: b * 255
      };
    };

    Convert.hueToRGB = function (p, q, t) {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };

    Convert.rgbToHSV = function (r, g, b) {
      var d, h, max, min, s, v;
      r /= 255;
      g /= 255;
      b /= 255;
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      v = max;
      d = max - min;
      s = max === 0 ? 0 : d / max;
      if (max === min) {
        h = 0;
      } else {
        h = (function () {
          switch (max) {
            case r:
              return (g - b) / d + (g < b ? 6 : 0);
            case g:
              return (b - r) / d + 2;
            case b:
              return (r - g) / d + 4;
          }
        })();
        h /= 6;
      }
      return {
        h: h,
        s: s,
        v: v
      };
    };

    Convert.hsvToRGB = function (h, s, v) {
      var b, f, g, i, p, q, r, t;
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
      }
      return {
        r: r * 255,
        g: g * 255,
        b: b * 255
      };
    };

    Convert.rgbToXYZ = function (r, g, b) {
      var x, y, z;
      r /= 255;
      g /= 255;
      b /= 255;
      if (r > 0.04045) {
        r = Math.pow((r + 0.055) / 1.055, 2.4);
      } else {
        r /= 12.92;
      }
      if (g > 0.04045) {
        g = Math.pow((g + 0.055) / 1.055, 2.4);
      } else {
        g /= 12.92;
      }
      if (b > 0.04045) {
        b = Math.pow((b + 0.055) / 1.055, 2.4);
      } else {
        b /= 12.92;
      }
      x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return {
        x: x * 100,
        y: y * 100,
        z: z * 100
      };
    };

    Convert.xyzToRGB = function (x, y, z) {
      var b, g, r;
      x /= 100;
      y /= 100;
      z /= 100;
      r = 3.2406 * x + -1.5372 * y + -0.4986 * z;
      g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
      b = 0.0557 * x + -0.204 * y + 1.057 * z;
      if (r > 0.0031308) {
        r = 1.055 * Math.pow(r, 0.4166666667) - 0.055;
      } else {
        r *= 12.92;
      }
      if (g > 0.0031308) {
        g = 1.055 * Math.pow(g, 0.4166666667) - 0.055;
      } else {
        g *= 12.92;
      }
      if (b > 0.0031308) {
        b = 1.055 * Math.pow(b, 0.4166666667) - 0.055;
      } else {
        b *= 12.92;
      }
      return {
        r: r * 255,
        g: g * 255,
        b: b * 255
      };
    };

    Convert.xyzToLab = function (x, y, z) {
      var a, b, l, whiteX, whiteY, whiteZ;
      if (typeof x === 'object') {
        y = x.y;
        z = x.z;
        x = x.x;
      }
      whiteX = 95.047;
      whiteY = 100.0;
      whiteZ = 108.883;
      x /= whiteX;
      y /= whiteY;
      z /= whiteZ;
      if (x > 0.008856451679) {
        x = Math.pow(x, 0.3333333333);
      } else {
        x = 7.787037037 * x + 0.1379310345;
      }
      if (y > 0.008856451679) {
        y = Math.pow(y, 0.3333333333);
      } else {
        y = 7.787037037 * y + 0.1379310345;
      }
      if (z > 0.008856451679) {
        z = Math.pow(z, 0.3333333333);
      } else {
        z = 7.787037037 * z + 0.1379310345;
      }
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return {
        l: l,
        a: a,
        b: b
      };
    };

    Convert.labToXYZ = function (l, a, b) {
      var x, y, z;
      if (typeof l === 'object') {
        a = l.a;
        b = l.b;
        l = l.l;
      }
      y = (l + 16) / 116;
      x = y + a / 500;
      z = y - b / 200;
      if (x > 0.2068965517) {
        x = x * x * x;
      } else {
        x = 0.1284185493 * (x - 0.1379310345);
      }
      if (y > 0.2068965517) {
        y = y * y * y;
      } else {
        y = 0.1284185493 * (y - 0.1379310345);
      }
      if (z > 0.2068965517) {
        z = z * z * z;
      } else {
        z = 0.1284185493 * (z - 0.1379310345);
      }
      return {
        x: x * 95.047,
        y: y * 100.0,
        z: z * 108.883
      };
    };

    Convert.rgbToLab = function (r, g, b) {
      var xyz;
      if (typeof r === 'object') {
        g = r.g;
        b = r.b;
        r = r.r;
      }
      xyz = this.rgbToXYZ(r, g, b);
      return this.xyzToLab(xyz);
    };

    Convert.labToRGB = function (l, a, b) {};

    return Convert;
  })();

  Event = (function () {
    function Event() {}

    Event.events = {};

    Event.types = [
      'processStart',
      'processComplete',
      'renderStart',
      'renderFinished',
      'blockStarted',
      'blockFinished'
    ];

    Event.trigger = function (target, type, data) {
      var event, _i, _len, _ref, _results;
      if (this.events[type] && this.events[type].length) {
        _ref = this.events[type];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          if (event.target === null || target.id === event.target.id) {
            _results.push(event.fn.call(target, data));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Event.listen = function (target, type, fn) {
      var _fn, _type;
      if (typeof target === 'string') {
        _type = target;
        _fn = type;
        target = null;
        type = _type;
        fn = _fn;
      }
      if (__indexOf.call(this.types, type) < 0) {
        return false;
      }
      if (!this.events[type]) {
        this.events[type] = [];
      }
      this.events[type].push({
        target: target,
        fn: fn
      });
      return true;
    };

    return Event;
  })();

  Caman.Event = Event;

  Caman.Filter = Filter = (function () {
    function Filter() {}

    Filter.Type = {
      Single: 1,
      Kernel: 2,
      LayerDequeue: 3,
      LayerFinished: 4,
      LoadOverlay: 5,
      Plugin: 6
    };

    Filter.register = function (name, filterFunc) {
      return (Caman.prototype[name] = filterFunc);
    };

    return Filter;
  })();

  Caman.IO = IO = (function () {
    function IO() {}

    IO.domainRegex = /(?:(?:http|https):\/\/)((?:\w+)\.(?:(?:\w|\.)+))/;

    IO.isRemote = function (img) {
      if (img == null) {
        return false;
      }
      if (this.corsEnabled(img)) {
        return false;
      }
      return this.isURLRemote(img.src);
    };

    IO.corsEnabled = function (img) {
      var _ref;
      return (
        img.crossOrigin != null &&
        ((_ref = img.crossOrigin.toLowerCase()) === 'anonymous' ||
          _ref === 'use-credentials')
      );
    };

    IO.isURLRemote = function (url) {
      var matches;
      matches = url.match(this.domainRegex);
      if (matches) {
        return matches[1] !== document.domain;
      } else {
        return false;
      }
    };

    IO.remoteCheck = function (src) {
      if (this.isURLRemote(src)) {
        if (!Caman.remoteProxy.length) {
          Log.info(
            'Attempting to load a remote image without a configured proxy. URL: ' +
              src
          );
        } else {
          if (Caman.isURLRemote(Caman.remoteProxy)) {
            Log.info('Cannot use a remote proxy for loading images.');
            return;
          }
          return (
            '' + Caman.remoteProxy + '?camanProxyUrl=' + encodeURIComponent(src)
          );
        }
      }
    };

    IO.proxyUrl = function (src) {
      return (
        '' +
        Caman.remoteProxy +
        '?' +
        Caman.proxyParam +
        '=' +
        encodeURIComponent(src)
      );
    };

    IO.useProxy = function (lang) {
      var langToExt;
      langToExt = {
        ruby: 'rb',
        python: 'py',
        perl: 'pl',
        javascript: 'js'
      };
      lang = lang.toLowerCase();
      if (langToExt[lang] != null) {
        lang = langToExt[lang];
      }
      return 'proxies/caman_proxy.' + lang;
    };

    return IO;
  })();

  Caman.prototype.save = function () {
    if (typeof exports !== 'undefined' && exports !== null) {
      return this.nodeSave.apply(this, arguments);
    } else {
      return this.browserSave.apply(this, arguments);
    }
  };

  Caman.prototype.browserSave = function (type) {
    var image;
    if (type == null) {
      type = 'png';
    }
    type = type.toLowerCase();
    image = this.toBase64(type).replace('image/' + type, 'image/octet-stream');
    return (document.location.href = image);
  };

  Caman.prototype.nodeSave = function (file, overwrite) {
    var stats;
    if (overwrite == null) {
      overwrite = true;
    }
    try {
      stats = fs.statSync(file);
      if (stats.isFile() && !overwrite) {
        return false;
      }
    } catch (e) {
      Log.debug('Creating output file ' + file);
    }
    return fs.writeFile(file, this.canvas.toBuffer(), function () {
      return Log.debug('Finished writing to ' + file);
    });
  };

  Caman.prototype.toImage = function (type) {
    var img;
    img = document.createElement('img');
    img.src = this.toBase64(type);
    img.width = this.dimensions.width;
    img.height = this.dimensions.height;
    if (window.devicePixelRatio) {
      img.width /= window.devicePixelRatio;
      img.height /= window.devicePixelRatio;
    }
    return img;
  };

  Caman.prototype.toBase64 = function (type) {
    if (type == null) {
      type = 'png';
    }
    type = type.toLowerCase();
    return this.canvas.toDataURL('image/' + type);
  };

  Layer = (function () {
    function Layer(c) {
      this.c = c;
      this.filter = this.c;
      this.options = {
        blendingMode: 'normal',
        opacity: 1.0
      };
      this.layerID = Util.uniqid.get();
      this.canvas =
        typeof exports !== 'undefined' && exports !== null
          ? new Canvas()
          : document.createElement('canvas');
      this.canvas.width = this.c.dimensions.width;
      this.canvas.height = this.c.dimensions.height;
      this.context = this.canvas.getContext('2d');
      this.context.createImageData(this.canvas.width, this.canvas.height);
      this.imageData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.pixelData = this.imageData.data;
    }

    Layer.prototype.newLayer = function (cb) {
      return this.c.newLayer.call(this.c, cb);
    };

    Layer.prototype.setBlendingMode = function (mode) {
      this.options.blendingMode = mode;
      return this;
    };

    Layer.prototype.opacity = function (opacity) {
      this.options.opacity = opacity / 100;
      return this;
    };

    Layer.prototype.copyParent = function () {
      var i, parentData, _i, _ref;
      parentData = this.c.pixelData;
      for (i = _i = 0, _ref = this.c.pixelData.length; _i < _ref; i = _i += 4) {
        this.pixelData[i] = parentData[i];
        this.pixelData[i + 1] = parentData[i + 1];
        this.pixelData[i + 2] = parentData[i + 2];
        this.pixelData[i + 3] = parentData[i + 3];
      }
      return this;
    };

    Layer.prototype.fillColor = function () {
      return this.c.fillColor.apply(this.c, arguments);
    };

    Layer.prototype.overlayImage = function (image) {
      if (typeof image === 'object') {
        image = image.src;
      } else if (typeof image === 'string' && image[0] === '#') {
        image = $(image).src;
      }
      if (!image) {
        return this;
      }
      this.c.renderer.renderQueue.push({
        type: Filter.Type.LoadOverlay,
        src: image,
        layer: this
      });
      return this;
    };

    Layer.prototype.applyToParent = function () {
      var i,
        layerData,
        parentData,
        result,
        rgbaLayer,
        rgbaParent,
        _i,
        _ref,
        _results;
      parentData = this.c.pixelStack[this.c.pixelStack.length - 1];
      layerData = this.c.pixelData;
      _results = [];
      for (i = _i = 0, _ref = layerData.length; _i < _ref; i = _i += 4) {
        rgbaParent = {
          r: parentData[i],
          g: parentData[i + 1],
          b: parentData[i + 2],
          a: parentData[i + 3]
        };
        rgbaLayer = {
          r: layerData[i],
          g: layerData[i + 1],
          b: layerData[i + 2],
          a: layerData[i + 3]
        };
        result = Blender.execute(
          this.options.blendingMode,
          rgbaLayer,
          rgbaParent
        );
        result.r = Util.clampRGB(result.r);
        result.g = Util.clampRGB(result.g);
        result.b = Util.clampRGB(result.b);
        if (result.a == null) {
          result.a = rgbaLayer.a;
        }
        parentData[i] =
          rgbaParent.r -
          (rgbaParent.r - result.r) * (this.options.opacity * (result.a / 255));
        parentData[i + 1] =
          rgbaParent.g -
          (rgbaParent.g - result.g) * (this.options.opacity * (result.a / 255));
        _results.push(
          (parentData[i + 2] =
            rgbaParent.b -
            (rgbaParent.b - result.b) *
              (this.options.opacity * (result.a / 255)))
        );
      }
      return _results;
    };

    return Layer;
  })();

  Logger = (function () {
    function Logger() {
      var name, _i, _len, _ref;
      _ref = ['log', 'info', 'warn', 'error'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this[name] = (function (name) {
          return function () {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (!Caman.DEBUG) {
              return;
            }
            try {
              return console[name].apply(console, args);
            } catch (e) {
              return console[name](args);
            }
          };
        })(name);
      }
      this.debug = this.log;
    }

    return Logger;
  })();

  Log = new Logger();

  PixelInfo = (function () {
    PixelInfo.coordinatesToLocation = function (x, y, width) {
      return (y * width + x) * 4;
    };

    PixelInfo.locationToCoordinates = function (loc, width) {
      var x, y;
      y = Math.floor(loc / (width * 4));
      x = (loc % (width * 4)) / 4;
      return {
        x: x,
        y: y
      };
    };

    function PixelInfo(c) {
      this.c = c;
      this.loc = 0;
    }

    PixelInfo.prototype.locationXY = function () {
      var x, y;
      y =
        this.c.dimensions.height -
        Math.floor(this.loc / (this.c.dimensions.width * 4));
      x = (this.loc % (this.c.dimensions.width * 4)) / 4;
      return {
        x: x,
        y: y
      };
    };

    PixelInfo.prototype.getPixelRelative = function (horiz, vert) {
      var newLoc;
      newLoc = this.loc + this.c.dimensions.width * 4 * (vert * -1) + 4 * horiz;
      if (newLoc > this.c.pixelData.length || newLoc < 0) {
        return {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };
      }
      return {
        r: this.c.pixelData[newLoc],
        g: this.c.pixelData[newLoc + 1],
        b: this.c.pixelData[newLoc + 2],
        a: this.c.pixelData[newLoc + 3]
      };
    };

    PixelInfo.prototype.putPixelRelative = function (horiz, vert, rgba) {
      var nowLoc;
      nowLoc = this.loc + this.c.dimensions.width * 4 * (vert * -1) + 4 * horiz;
      if (newLoc > this.c.pixelData.length || newLoc < 0) {
        return;
      }
      this.c.pixelData[newLoc] = rgba.r;
      this.c.pixelData[newLoc + 1] = rgba.g;
      this.c.pixelData[newLoc + 2] = rgba.b;
      this.c.pixelData[newLoc + 3] = rgba.a;
      return true;
    };

    PixelInfo.prototype.getPixel = function (x, y) {
      var loc;
      loc = this.coordinatesToLocation(x, y, this.width);
      return {
        r: this.c.pixelData[loc],
        g: this.c.pixelData[loc + 1],
        b: this.c.pixelData[loc + 2],
        a: this.c.pixelData[loc + 3]
      };
    };

    PixelInfo.prototype.putPixel = function (x, y, rgba) {
      var loc;
      loc = this.coordinatesToLocation(x, y, this.width);
      this.c.pixelData[loc] = rgba.r;
      this.c.pixelData[loc + 1] = rgba.g;
      this.c.pixelData[loc + 2] = rgba.b;
      return (this.c.pixelData[loc + 3] = rgba.a);
    };

    return PixelInfo;
  })();

  Plugin = (function () {
    function Plugin() {}

    Plugin.plugins = {};

    Plugin.register = function (name, plugin) {
      return (this.plugins[name] = plugin);
    };

    Plugin.execute = function (context, name, args) {
      return this.plugins[name].apply(context, args);
    };

    return Plugin;
  })();

  Caman.Plugin = Plugin;

  Caman.Renderer = Renderer = (function () {
    Renderer.Blocks = Caman.NodeJS ? require('os').cpus().length : 4;

    function Renderer(c) {
      var _this = this;
      this.c = c;
      this.processNext = function () {
        return Renderer.prototype.processNext.apply(_this, arguments);
      };
      this.renderQueue = [];
      this.modPixelData = null;
    }

    Renderer.prototype.add = function (job) {
      if (job == null) {
        return;
      }
      return this.renderQueue.push(job);
    };

    Renderer.prototype.processNext = function () {
      var layer;
      if (this.renderQueue.length === 0) {
        Event.trigger(this, 'renderFinished');
        if (this.finishedFn != null) {
          this.finishedFn.call(this.c);
        }
        return this;
      }
      this.currentJob = this.renderQueue.shift();
      switch (this.currentJob.type) {
        case Filter.Type.LayerDequeue:
          layer = this.c.canvasQueue.shift();
          this.c.executeLayer(layer);
          return this.processNext();
        case Filter.Type.LayerFinished:
          this.c.applyCurrentLayer();
          this.c.popContext();
          return this.processNext();
        case Filter.Type.LoadOverlay:
          return this.loadOverlay(this.currentJob.layer, this.currentJob.src);
        case Filter.Type.Plugin:
          return this.executePlugin();
        default:
          return this.executeFilter();
      }
    };

    Renderer.prototype.execute = function (callback) {
      this.finishedFn = callback;
      this.modPixelData = Util.dataArray(this.c.pixelData.length);
      return this.processNext();
    };

    Renderer.prototype.eachBlock = function (fn) {
      var blockN,
        blockPixelLength,
        bnum,
        end,
        f,
        i,
        lastBlockN,
        n,
        start,
        _i,
        _ref,
        _results,
        _this = this;
      this.blocksDone = 0;
      n = this.c.pixelData.length;
      blockPixelLength = Math.floor(n / 4 / Renderer.Blocks);
      blockN = blockPixelLength * 4;
      lastBlockN = blockN + ((n / 4) % Renderer.Blocks) * 4;
      _results = [];
      for (
        i = _i = 0, _ref = Renderer.Blocks;
        0 <= _ref ? _i < _ref : _i > _ref;
        i = 0 <= _ref ? ++_i : --_i
      ) {
        start = i * blockN;
        end = start + (i === Renderer.Blocks - 1 ? lastBlockN : blockN);
        if (Caman.NodeJS) {
          f = Fiber(function () {
            return fn.call(_this, i, start, end);
          });
          bnum = f.run();
          _results.push(this.blockFinished(bnum));
        } else {
          _results.push(
            setTimeout(
              (function (i, start, end) {
                return function () {
                  return fn.call(_this, i, start, end);
                };
              })(i, start, end),
              0
            )
          );
        }
      }
      return _results;
    };

    Renderer.prototype.executeFilter = function () {
      Event.trigger(this.c, 'processStart', this.currentJob);
      if (this.currentJob.type === Filter.Type.Single) {
        return this.eachBlock(this.renderBlock);
      } else {
        return this.eachBlock(this.renderKernel);
      }
    };

    Renderer.prototype.executePlugin = function () {
      Log.debug('Executing plugin ' + this.currentJob.plugin);
      Plugin.execute(this.c, this.currentJob.plugin, this.currentJob.args);
      Log.debug('Plugin ' + this.currentJob.plugin + ' finished!');
      return this.processNext();
    };

    Renderer.prototype.renderBlock = function (bnum, start, end) {
      var data, i, pixelInfo, res, _i;
      Log.debug(
        'Block #' +
          bnum +
          ' - Filter: ' +
          this.currentJob.name +
          ', Start: ' +
          start +
          ', End: ' +
          end
      );
      Event.trigger(this.c, 'blockStarted', {
        blockNum: bnum,
        totalBlocks: Renderer.Blocks,
        startPixel: start,
        endPixel: end
      });
      data = {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      };
      pixelInfo = new PixelInfo(this.c);
      for (i = _i = start; _i < end; i = _i += 4) {
        pixelInfo.loc = i;
        data.r = this.c.pixelData[i];
        data.g = this.c.pixelData[i + 1];
        data.b = this.c.pixelData[i + 2];
        data.a = this.c.pixelData[i + 3];
        res = this.currentJob.processFn.call(pixelInfo, data);
        if (res.a == null) {
          res.a = data.a;
        }
        this.c.pixelData[i] = Util.clampRGB(res.r);
        this.c.pixelData[i + 1] = Util.clampRGB(res.g);
        this.c.pixelData[i + 2] = Util.clampRGB(res.b);
        this.c.pixelData[i + 3] = Util.clampRGB(res.a);
      }
      if (Caman.NodeJS) {
        return Fiber['yield'](bnum);
      } else {
        return this.blockFinished(bnum);
      }
    };

    Renderer.prototype.renderKernel = function (bnum, start, end) {
      var adjust,
        adjustSize,
        bias,
        builder,
        builderIndex,
        divisor,
        i,
        j,
        k,
        kernel,
        n,
        name,
        pixel,
        pixelInfo,
        res,
        _i,
        _j,
        _k;
      name = this.currentJob.name;
      bias = this.currentJob.bias;
      divisor = this.currentJob.divisor;
      n = this.c.pixelData.length;
      adjust = this.currentJob.adjust;
      adjustSize = Math.sqrt(adjust.length);
      kernel = [];
      Log.debug('Rendering kernel - Filter: ' + this.currentJob.name);
      start = Math.max(
        start,
        this.c.dimensions.width * 4 * ((adjustSize - 1) / 2)
      );
      end = Math.min(
        end,
        n - this.c.dimensions.width * 4 * ((adjustSize - 1) / 2)
      );
      builder = (adjustSize - 1) / 2;
      pixelInfo = new PixelInfo(this.c);
      for (i = _i = start; _i < end; i = _i += 4) {
        pixelInfo.loc = i;
        builderIndex = 0;
        for (
          j = _j = -builder;
          -builder <= builder ? _j <= builder : _j >= builder;
          j = -builder <= builder ? ++_j : --_j
        ) {
          for (
            k = _k = builder;
            builder <= -builder ? _k <= -builder : _k >= -builder;
            k = builder <= -builder ? ++_k : --_k
          ) {
            pixel = pixelInfo.getPixelRelative(j, k);
            kernel[builderIndex * 3] = pixel.r;
            kernel[builderIndex * 3 + 1] = pixel.g;
            kernel[builderIndex * 3 + 2] = pixel.b;
            builderIndex++;
          }
        }
        res = this.processKernel(adjust, kernel, divisor, bias);
        this.modPixelData[i] = Util.clampRGB(res.r);
        this.modPixelData[i + 1] = Util.clampRGB(res.g);
        this.modPixelData[i + 2] = Util.clampRGB(res.b);
        this.modPixelData[i + 3] = this.c.pixelData[i + 3];
      }
      if (Caman.NodeJS) {
        return Fiber['yield'](bnum);
      } else {
        return this.blockFinished(bnum);
      }
    };

    Renderer.prototype.blockFinished = function (bnum) {
      var i, _i, _ref;
      if (bnum >= 0) {
        Log.debug(
          'Block #' + bnum + ' finished! Filter: ' + this.currentJob.name
        );
      }
      this.blocksDone++;
      Event.trigger(this.c, 'blockFinished', {
        blockNum: bnum,
        blocksFinished: this.blocksDone,
        totalBlocks: Renderer.Blocks
      });
      if (this.blocksDone === Renderer.Blocks) {
        if (this.currentJob.type === Filter.Type.Kernel) {
          for (
            i = _i = 0, _ref = this.c.pixelData.length;
            0 <= _ref ? _i < _ref : _i > _ref;
            i = 0 <= _ref ? ++_i : --_i
          ) {
            this.c.pixelData[i] = this.modPixelData[i];
          }
        }
        if (bnum >= 0) {
          Log.debug('Filter ' + this.currentJob.name + ' finished!');
        }
        Event.trigger(this.c, 'processComplete', this.currentJob);
        return this.processNext();
      }
    };

    Renderer.prototype.processKernel = function (
      adjust,
      kernel,
      divisor,
      bias
    ) {
      var i, val, _i, _ref;
      val = {
        r: 0,
        g: 0,
        b: 0
      };
      for (
        i = _i = 0, _ref = adjust.length;
        0 <= _ref ? _i < _ref : _i > _ref;
        i = 0 <= _ref ? ++_i : --_i
      ) {
        val.r += adjust[i] * kernel[i * 3];
        val.g += adjust[i] * kernel[i * 3 + 1];
        val.b += adjust[i] * kernel[i * 3 + 2];
      }
      val.r = val.r / divisor + bias;
      val.g = val.g / divisor + bias;
      val.b = val.b / divisor + bias;
      return val;
    };

    Renderer.prototype.loadOverlay = function (layer, src) {
      var img,
        proxyUrl,
        _this = this;
      img = document.createElement('img');
      img.onload = function () {
        layer.context.drawImage(
          img,
          0,
          0,
          _this.c.dimensions.width,
          _this.c.dimensions.height
        );
        layer.imageData = layer.context.getImageData(
          0,
          0,
          _this.c.dimensions.width,
          _this.c.dimensions.height
        );
        layer.pixelData = layer.imageData.data;
        _this.c.pixelData = layer.pixelData;
        return _this.processNext();
      };
      proxyUrl = IO.remoteCheck(src);
      return (img.src = proxyUrl != null ? proxyUrl : src);
    };

    return Renderer;
  })();

  Caman.Store = Store = (function () {
    function Store() {}

    Store.items = {};

    Store.has = function (search) {
      return this.items[search] != null;
    };

    Store.get = function (search) {
      return this.items[search];
    };

    Store.put = function (name, obj) {
      return (this.items[name] = obj);
    };

    Store.execute = function (search, callback) {
      var _this = this;
      setTimeout(function () {
        return callback.call(_this.get(search), _this.get(search));
      }, 0);
      return this.get(search);
    };

    Store.flush = function (name) {
      if (name == null) {
        name = false;
      }
      if (name) {
        return delete this.items[name];
      } else {
        return (this.items = {});
      }
    };

    return Store;
  })();

  Blender.register('normal', function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaLayer.r,
      g: rgbaLayer.g,
      b: rgbaLayer.b
    };
  });

  Blender.register('multiply', function (rgbaLayer, rgbaParent) {
    return {
      r: (rgbaLayer.r * rgbaParent.r) / 255,
      g: (rgbaLayer.g * rgbaParent.g) / 255,
      b: (rgbaLayer.b * rgbaParent.b) / 255
    };
  });

  Blender.register('screen', function (rgbaLayer, rgbaParent) {
    return {
      r: 255 - ((255 - rgbaLayer.r) * (255 - rgbaParent.r)) / 255,
      g: 255 - ((255 - rgbaLayer.g) * (255 - rgbaParent.g)) / 255,
      b: 255 - ((255 - rgbaLayer.b) * (255 - rgbaParent.b)) / 255
    };
  });

  Blender.register('overlay', function (rgbaLayer, rgbaParent) {
    var result;
    result = {};
    result.r =
      rgbaParent.r > 128
        ? 255 - (2 * (255 - rgbaLayer.r) * (255 - rgbaParent.r)) / 255
        : (rgbaParent.r * rgbaLayer.r * 2) / 255;
    result.g =
      rgbaParent.g > 128
        ? 255 - (2 * (255 - rgbaLayer.g) * (255 - rgbaParent.g)) / 255
        : (rgbaParent.g * rgbaLayer.g * 2) / 255;
    result.b =
      rgbaParent.b > 128
        ? 255 - (2 * (255 - rgbaLayer.b) * (255 - rgbaParent.b)) / 255
        : (rgbaParent.b * rgbaLayer.b * 2) / 255;
    return result;
  });

  Blender.register('difference', function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaLayer.r - rgbaParent.r,
      g: rgbaLayer.g - rgbaParent.g,
      b: rgbaLayer.b - rgbaParent.b
    };
  });

  Blender.register('addition', function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaParent.r + rgbaLayer.r,
      g: rgbaParent.g + rgbaLayer.g,
      b: rgbaParent.b + rgbaLayer.b
    };
  });

  Blender.register('exclusion', function (rgbaLayer, rgbaParent) {
    return {
      r: 128 - (2 * (rgbaParent.r - 128) * (rgbaLayer.r - 128)) / 255,
      g: 128 - (2 * (rgbaParent.g - 128) * (rgbaLayer.g - 128)) / 255,
      b: 128 - (2 * (rgbaParent.b - 128) * (rgbaLayer.b - 128)) / 255
    };
  });

  Blender.register('softLight', function (rgbaLayer, rgbaParent) {
    var result;
    result = {};
    result.r =
      rgbaParent.r > 128
        ? 255 - ((255 - rgbaParent.r) * (255 - (rgbaLayer.r - 128))) / 255
        : (rgbaParent.r * (rgbaLayer.r + 128)) / 255;
    result.g =
      rgbaParent.g > 128
        ? 255 - ((255 - rgbaParent.g) * (255 - (rgbaLayer.g - 128))) / 255
        : (rgbaParent.g * (rgbaLayer.g + 128)) / 255;
    result.b =
      rgbaParent.b > 128
        ? 255 - ((255 - rgbaParent.b) * (255 - (rgbaLayer.b - 128))) / 255
        : (rgbaParent.b * (rgbaLayer.b + 128)) / 255;
    return result;
  });

  Blender.register('lighten', function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaParent.r > rgbaLayer.r ? rgbaParent.r : rgbaLayer.r,
      g: rgbaParent.g > rgbaLayer.g ? rgbaParent.g : rgbaLayer.g,
      b: rgbaParent.b > rgbaLayer.b ? rgbaParent.b : rgbaLayer.b
    };
  });

  Blender.register('darken', function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaParent.r > rgbaLayer.r ? rgbaLayer.r : rgbaParent.r,
      g: rgbaParent.g > rgbaLayer.g ? rgbaLayer.g : rgbaParent.g,
      b: rgbaParent.b > rgbaLayer.b ? rgbaLayer.b : rgbaParent.b
    };
  });

  Filter.register('fillColor', function () {
    var color;
    if (arguments.length === 1) {
      color = Convert.hexToRGB(arguments[0]);
    } else {
      color = {
        r: arguments[0],
        g: arguments[1],
        b: arguments[2]
      };
    }
    return this.process('fillColor', function (rgba) {
      rgba.r = color.r;
      rgba.g = color.g;
      rgba.b = color.b;
      rgba.a = 255;
      return rgba;
    });
  });

  Filter.register('brightness', function (adjust) {
    adjust = Math.floor(255 * (adjust / 100));
    return this.process('brightness', function (rgba) {
      rgba.r += adjust;
      rgba.g += adjust;
      rgba.b += adjust;
      return rgba;
    });
  });

  Filter.register('saturation', function (adjust) {
    adjust *= -0.01;
    return this.process('saturation', function (rgba) {
      var max;
      max = Math.max(rgba.r, rgba.g, rgba.b);
      if (rgba.r !== max) {
        rgba.r += (max - rgba.r) * adjust;
      }
      if (rgba.g !== max) {
        rgba.g += (max - rgba.g) * adjust;
      }
      if (rgba.b !== max) {
        rgba.b += (max - rgba.b) * adjust;
      }
      return rgba;
    });
  });

  Filter.register('vibrance', function (adjust) {
    adjust *= -1;
    return this.process('vibrance', function (rgba) {
      var amt, avg, max;
      max = Math.max(rgba.r, rgba.g, rgba.b);
      avg = (rgba.r + rgba.g + rgba.b) / 3;
      amt = (((Math.abs(max - avg) * 2) / 255) * adjust) / 100;
      if (rgba.r !== max) {
        rgba.r += (max - rgba.r) * amt;
      }
      if (rgba.g !== max) {
        rgba.g += (max - rgba.g) * amt;
      }
      if (rgba.b !== max) {
        rgba.b += (max - rgba.b) * amt;
      }
      return rgba;
    });
  });

  Filter.register('greyscale', function (adjust) {
    return this.process('greyscale', function (rgba) {
      var avg;
      avg = Calculate.luminance(rgba);
      rgba.r = avg;
      rgba.g = avg;
      rgba.b = avg;
      return rgba;
    });
  });

  Filter.register('contrast', function (adjust) {
    adjust = Math.pow((adjust + 100) / 100, 2);
    return this.process('contrast', function (rgba) {
      rgba.r /= 255;
      rgba.r -= 0.5;
      rgba.r *= adjust;
      rgba.r += 0.5;
      rgba.r *= 255;
      rgba.g /= 255;
      rgba.g -= 0.5;
      rgba.g *= adjust;
      rgba.g += 0.5;
      rgba.g *= 255;
      rgba.b /= 255;
      rgba.b -= 0.5;
      rgba.b *= adjust;
      rgba.b += 0.5;
      rgba.b *= 255;
      return rgba;
    });
  });

  Filter.register('hue', function (adjust) {
    return this.process('hue', function (rgba) {
      var h, hsv, rgb;
      hsv = Convert.rgbToHSV(rgba.r, rgba.g, rgba.b);
      h = hsv.h * 100;
      h += Math.abs(adjust);
      h = h % 100;
      h /= 100;
      hsv.h = h;
      rgb = Convert.hsvToRGB(hsv.h, hsv.s, hsv.v);
      rgb.a = rgba.a;
      return rgb;
    });
  });

  Filter.register('colorize', function () {
    var level, rgb;
    if (arguments.length === 2) {
      rgb = Convert.hexToRGB(arguments[0]);
      level = arguments[1];
    } else if (arguments.length === 4) {
      rgb = {
        r: arguments[0],
        g: arguments[1],
        b: arguments[2]
      };
      level = arguments[3];
    }
    return this.process('colorize', function (rgba) {
      rgba.r -= (rgba.r - rgb.r) * (level / 100);
      rgba.g -= (rgba.g - rgb.g) * (level / 100);
      rgba.b -= (rgba.b - rgb.b) * (level / 100);
      return rgba;
    });
  });

  Filter.register('invert', function () {
    return this.process('invert', function (rgba) {
      rgba.r = 255 - rgba.r;
      rgba.g = 255 - rgba.g;
      rgba.b = 255 - rgba.b;
      return rgba;
    });
  });

  Filter.register('sepia', function (adjust) {
    if (adjust == null) {
      adjust = 100;
    }
    adjust /= 100;
    return this.process('sepia', function (rgba) {
      rgba.r = Math.min(
        255,
        rgba.r * (1 - 0.607 * adjust) +
          rgba.g * (0.769 * adjust) +
          rgba.b * (0.189 * adjust)
      );
      rgba.g = Math.min(
        255,
        rgba.r * (0.349 * adjust) +
          rgba.g * (1 - 0.314 * adjust) +
          rgba.b * (0.168 * adjust)
      );
      rgba.b = Math.min(
        255,
        rgba.r * (0.272 * adjust) +
          rgba.g * (0.534 * adjust) +
          rgba.b * (1 - 0.869 * adjust)
      );
      return rgba;
    });
  });

  Filter.register('gamma', function (adjust) {
    return this.process('gamma', function (rgba) {
      rgba.r = Math.pow(rgba.r / 255, adjust) * 255;
      rgba.g = Math.pow(rgba.g / 255, adjust) * 255;
      rgba.b = Math.pow(rgba.b / 255, adjust) * 255;
      return rgba;
    });
  });

  Filter.register('noise', function (adjust) {
    adjust = Math.abs(adjust) * 2.55;
    return this.process('noise', function (rgba) {
      var rand;
      rand = Calculate.randomRange(adjust * -1, adjust);
      rgba.r += rand;
      rgba.g += rand;
      rgba.b += rand;
      return rgba;
    });
  });

  Filter.register('clip', function (adjust) {
    adjust = Math.abs(adjust) * 2.55;
    return this.process('clip', function (rgba) {
      if (rgba.r > 255 - adjust) {
        rgba.r = 255;
      } else if (rgba.r < adjust) {
        rgba.r = 0;
      }
      if (rgba.g > 255 - adjust) {
        rgba.g = 255;
      } else if (rgba.g < adjust) {
        rgba.g = 0;
      }
      if (rgba.b > 255 - adjust) {
        rgba.b = 255;
      } else if (rgba.b < adjust) {
        rgba.b = 0;
      }
      return rgba;
    });
  });

  Filter.register('channels', function (options) {
    var chan, value;
    if (typeof options !== 'object') {
      return this;
    }
    for (chan in options) {
      if (!__hasProp.call(options, chan)) continue;
      value = options[chan];
      if (value === 0) {
        delete options[chan];
        continue;
      }
      options[chan] /= 100;
    }
    if (options.length === 0) {
      return this;
    }
    return this.process('channels', function (rgba) {
      if (options.red != null) {
        if (options.red > 0) {
          rgba.r += (255 - rgba.r) * options.red;
        } else {
          rgba.r -= rgba.r * Math.abs(options.red);
        }
      }
      if (options.green != null) {
        if (options.green > 0) {
          rgba.g += (255 - rgba.g) * options.green;
        } else {
          rgba.g -= rgba.g * Math.abs(options.green);
        }
      }
      if (options.blue != null) {
        if (options.blue > 0) {
          rgba.b += (255 - rgba.b) * options.blue;
        } else {
          rgba.b -= rgba.b * Math.abs(options.blue);
        }
      }
      return rgba;
    });
  });

  Filter.register('curves', function () {
    var bezier, chans, cps, ctrl1, ctrl2, end, i, start, _i, _j, _ref, _ref1;
    (chans = arguments[0]),
      (cps = 2 <= arguments.length ? __slice.call(arguments, 1) : []);
    if (typeof chans === 'string') {
      chans = chans.split('');
    }
    if (chans[0] === 'v') {
      chans = ['r', 'g', 'b'];
    }
    if (cps.length < 3 || cps.length > 4) {
      throw 'Invalid number of arguments to curves filter';
    }
    start = cps[0];
    ctrl1 = cps[1];
    ctrl2 = cps.length === 4 ? cps[2] : cps[1];
    end = cps[cps.length - 1];
    bezier = Calculate.bezier(start, ctrl1, ctrl2, end, 0, 255);
    if (start[0] > 0) {
      for (
        i = _i = 0, _ref = start[0];
        0 <= _ref ? _i < _ref : _i > _ref;
        i = 0 <= _ref ? ++_i : --_i
      ) {
        bezier[i] = start[1];
      }
    }
    if (end[0] < 255) {
      for (
        i = _j = _ref1 = end[0];
        _ref1 <= 255 ? _j <= 255 : _j >= 255;
        i = _ref1 <= 255 ? ++_j : --_j
      ) {
        bezier[i] = end[1];
      }
    }
    return this.process('curves', function (rgba) {
      var _k, _ref2;
      for (
        i = _k = 0, _ref2 = chans.length;
        0 <= _ref2 ? _k < _ref2 : _k > _ref2;
        i = 0 <= _ref2 ? ++_k : --_k
      ) {
        rgba[chans[i]] = bezier[rgba[chans[i]]];
      }
      return rgba;
    });
  });

  Filter.register('exposure', function (adjust) {
    var ctrl1, ctrl2, p;
    p = Math.abs(adjust) / 100;
    ctrl1 = [0, 255 * p];
    ctrl2 = [255 - 255 * p, 255];
    if (adjust < 0) {
      ctrl1 = ctrl1.reverse();
      ctrl2 = ctrl2.reverse();
    }
    return this.curves('rgb', [0, 0], ctrl1, ctrl2, [255, 255]);
  });

  Caman.Plugin.register('crop', function (width, height, x, y) {
    var canvas, ctx;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (typeof exports !== 'undefined' && exports !== null) {
      canvas = new Canvas(width, height);
    } else {
      canvas = document.createElement('canvas');
      Util.copyAttributes(this.canvas, canvas);
      canvas.width = width;
      canvas.height = height;
    }
    ctx = canvas.getContext('2d');
    ctx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
    this.cropCoordinates = {
      x: x,
      y: y
    };
    this.cropped = true;
    return this.replaceCanvas(canvas);
  });

  Caman.Plugin.register('resize', function (newDims) {
    var canvas, ctx;
    if (newDims == null) {
      newDims = null;
    }
    if (newDims === null || (newDims.width == null && newDims.height == null)) {
      Log.error('Invalid or missing dimensions given for resize');
      return;
    }
    if (newDims.width == null) {
      newDims.width = (this.canvas.width * newDims.height) / this.canvas.height;
    } else if (newDims.height == null) {
      newDims.height = (this.canvas.height * newDims.width) / this.canvas.width;
    }
    if (typeof exports !== 'undefined' && exports !== null) {
      canvas = new Canvas(newDims.width, newDims.height);
    } else {
      canvas = document.createElement('canvas');
      Util.copyAttributes(this.canvas, canvas);
      canvas.width = newDims.width;
      canvas.height = newDims.height;
    }
    ctx = canvas.getContext('2d');
    ctx.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      newDims.width,
      newDims.height
    );
    this.resized = true;
    return this.replaceCanvas(canvas);
  });

  Caman.Filter.register('crop', function () {
    return this.processPlugin('crop', Array.prototype.slice.call(arguments, 0));
  });

  Caman.Filter.register('resize', function () {
    return this.processPlugin(
      'resize',
      Array.prototype.slice.call(arguments, 0)
    );
  });
}

export default Caman;
