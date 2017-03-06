(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function(root, jQuery) {
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    factory(jQuery);
  }
}(function ($) {
  "use strict";

  // storage

  var storage;
  var storagePrefix = 'uk1_jq_';
  var lsExists = 'localStorage' in window;
  var ssExists = 'sessionStorage' in window;
  var coExists = (Cookies && 'noConflict' in Cookies);

  if (ssExists) {
    storage = sessionStorage;
  } else if (lsExists) {
    storage = localStorage;
  } else if (!coExists) {
    console.log("Web Storage is not supported!", "Cookies plugin is not supported!");
    throw new Error("There is a problem with browser storage!");
  }

  // $.ukey1

  $.ukey1 = function () {};

  var sdkVersion = '1.0.0';
  var apiVersion = '/v1';
  var ukey1GetParams = '_ukey1';
  var timeout = 10000;
  var userAgent = 'ukey1-jquery-sdk/';
  var authMethod = 'UKEY1 ';

  $.ukey1.defaults = {
    host: 'https://ukey1-api.nooledge.com'
  };

  // $.ukey1.connect

  $.ukey1.prototype.connect = function (o) {
    var endpoint = '/auth/connect';
    var options = checkOptions(o);
    var r, body;

    options.requestId = randomString();

    checkOption('options.requestId', options.requestId, 'string', true);
    checkOption('options.returnUrl', options.returnUrl, 'string', true);
    checkOption('options.scope', options.scope, 'array', false);

    options.method = 'POST';
    options.endpoint = endpoint;

    r = new Request(options);
    body = {
      'request_id': options.requestId,
      'scope': options.scope,
      'return_url': options.returnUrl
    };

    r.send(body, function (response) {
      connectCallback(response, options);
    });
  };

  // $.ukey1.accessToken

  $.ukey1.prototype.accessToken = function (o) {
    var endpoint = '/auth/token';
    var options = checkOptions(o);
    var r, body, requestId, connectId, status;

    checkOption('options.success', options.success, 'function', true);
    checkOption('options.finished', options.finished, 'function', true);

    if (storage) {
      options.requestId = storage.getItem(storagePrefix + 'requestId') + '';
      options.connectId = storage.getItem(storagePrefix + 'connectId') + '';

      storage.removeItem(storagePrefix + 'requestId');
      storage.removeItem(storagePrefix + 'connectId');
    } else {
      options.requestId = Cookies.get(storagePrefix + 'requestId') + '';
      options.connectId = Cookies.get(storagePrefix + 'connectId') + '';

      Cookies.remove(storagePrefix + 'requestId');
      Cookies.remove(storagePrefix + 'connectId');
    }

    if (!(options.requestId && options.connectId)) {
      console.log('No requestId and connectId in device storage');
      options.finished(false);
      return false;
    }

    requestId = getQueryParameter(ukey1GetParams + '[request_id]');
    connectId = getQueryParameter(ukey1GetParams + '[connect_id]');
    status = getQueryParameter(ukey1GetParams + '[result]');

    if (!requestId || requestId !== options.requestId) {
      console.log('Invalid requestId');
      options.finished(false);
      return false;
    }

    if (!connectId || connectId !== options.connectId) {
      console.log('Invalid connectId');
      options.finished(false);
      return false;
    }

    if (status !== 'authorized') {
      if (status === 'canceled') {
        console.log('User has canceled the request');
      } else if (status === 'expired') {
        console.log('The request expired');
      } else {
        console.log('Unknown status');
      }

      options.finished(false);
      return false;
    }

    options.method = 'POST';
    options.endpoint = endpoint;

    r = new Request(options);
    body = {
      'request_id': options.requestId,
      'connect_id': options.connectId
    };

    r.send(body, function (response) {
      accessTokenCallback(response, options);
    });
  };

  // Request

  function Request(o) {
    checkOption('options', o, 'object', true);
    checkOption('options.appId', o.appId, 'string', true);
    checkOption('options.host', o.host, 'string', true);
    checkOption('options.sdkVersion', o.sdkVersion, 'string', true);
    checkOption('options.apiVersion', o.apiVersion, 'string', true);
    checkOption('options.method', o.method, 'string', true, ['GET', 'POST']);
    checkOption('options.endpoint', o.endpoint, 'string', true);
    checkOption('options.accessToken', o.accessToken, 'string', false);

    this.o = o;
  }

  Request.prototype.prepareHeaders = function (h) {
    h['x-ukey1-user-agent'] = h['User-Agent'] = this.prepareUserAgent();
    h['x-ukey1-app'] = this.o.appId;

    if (this.o.accessToken) {
      h['Authorization'] = authMethod + this.o.accessToken;
    }

    return h;
  };

  Request.prototype.prepareUserAgent = function () {
    return userAgent + this.o.sdkVersion + ' Jquery/' + $.fn.jquery +
      (navigator ? ' ' + navigator.userAgent : '');
  };

  Request.prototype.send = function (body, callback) {
    var options = {}, headers = {};

    headers = this.prepareHeaders(headers);
    options.url = this.o.host + this.o.apiVersion + this.o.endpoint;
    options.method = options.type = this.o.method;
    options.timeout = timeout;
    options.jsonp = false;
    options.dataType = 'json';
    options.success = function(data, status, xhr) {
      var e = {};

      if (!data.result) {
        e = new Error('Invalid response structure');
        e.response = data;
        throw e;
      }

      if (data.result !== xhr.status) {
        e = new Error('Unexpected HTTP status ' + xhr.status);
        e.response = data;
        throw e;
      }

      if (!(data.result >= 200 && data.result < 300)) {
        throw new Error(data.debug.message);
      }

      callback(data);
    };
    options.error = function(xhr, status, error) {
      console.log(xhr.responseJSON.debug.message);
      throw error;
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
      options.data = JSON.stringify(body);
    }

    options.headers = headers;

    $.ajax(options);
  };

  // Helpers

  function checkOptions(o) {
    checkOption('options', o, 'object', true);
    checkOption('options.appId', o.appId, 'string', true);

    o.sdkVersion = sdkVersion;
    o.apiVersion = apiVersion;

    if (!o.host) {
      o.host = $.fn.ukey1.defaults.host;
    }

    return o;
  }

  function checkOption(o, v, t, r, a) {
    if (t === 'array') {
      if ((r && !v) || (v && Object.prototype.toString.call(v) !== '[object Array]')) {
        throw new Error('Unknown/invalid `' + o + '` (' + t + ' required)');
      }
    } else if (t === 'function') {
      if ((r && !v) || (v && Object.prototype.toString.call(v) !== '[object Function]')) {
        throw new Error('Unknown/invalid `' + o + '` (' + t + ' required)');
      }
    } else if ((r && !v) || (v && typeof v !== t)) {
      throw new Error('Unknown/invalid `' + o + '` (' + t + ' required)');
    }

    if (t === 'string') {
      if (a) {
        checkOption('checkOption(attribute a)', a, 'array', false);

        if (a.indexOf(v) < 0) {
          throw new Error('Unknown/invalid `' + o + '` (possible values are [' + a.join(',') + '])');
        }
      }
    }
  }

  function getQueryParameter(name, url) {
    var regex, results;

    if (!url) {
      url = window.location.href;
    }

    url = decodeURIComponent(url);
    name = name.replace(/[\[\]]/g, '\\$&');
    regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    results = regex.exec(url);

    if (!results) {
      return null;
    }

    if (!results[2]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function randomString() {
    return Math.random().toString(36).substr(2, 10) + '-' + new Date().getTime();
  }

  function connectCallback(data, options) {
    var gateway = data.gateway.url;

    if (options.signup) {
      gateway += (gateway.search(/\?/) >= 0 ? '&' : '?') + 'signup=1';
    }

    if (storage) {
      storage.setItem(storagePrefix + 'requestId', options.requestId);
      storage.setItem(storagePrefix + 'connectId', data.connect_id);
    } else {
      Cookies.set(storagePrefix + 'requestId', options.requestId);
      Cookies.set(storagePrefix + 'connectId', data.connect_id);
    }

    window.location = gateway;
  }

  function accessTokenCallback(data, options) {
    var endpoint = '/me';
    var r;

    options.accessToken = data.access_token;
    options.method = 'GET';
    options.endpoint = endpoint;

    r = new Request(options);

    r.send('', function (response) {
      userCallback(response, options);
    });
  }

  function userCallback(data, options) {
    if (!data.authorized) {
      throw new Error('User has canceled their consent to share data with your app');
    }

    options.success(data.user);
    options.finished(true);
  }
}));
