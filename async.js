(function() {
  var Deferred, Promise, Then, async, toType,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  toType = function(object) {
    var result;
    if (object === null) {
      return result = "null";
    } else if (object === void 0) {
      return result = "undefined";
    } else {
      return result = Object.prototype.toString.call(object).slice(8, -1);
    }
  };

  Deferred = (function() {

    function Deferred() {
      this.reject = __bind(this.reject, this);
      this.resolve = __bind(this.resolve, this);
      this.setThen = __bind(this.setThen, this);      this.promise = new Promise(this);
      this._fulfillment = void 0;
      this._then = void 0;
    }

    Deferred.prototype.isFulfilled = function() {
      return this._fulfillment != null;
    };

    Deferred.prototype.setThen = function(success, failure) {
      var fulfillment, _then;
      _then = this._then = new Then(success, failure);
      if (fulfillment = this._fulfillment) {
        _then["do"](fulfillment.type, fulfillment.result);
      }
      return _then.promise;
    };

    Deferred.prototype.resolve = function(result) {
      return this._fulfill('resolve', result);
    };

    Deferred.prototype.reject = function(result) {
      return this._fulfill('reject', result);
    };

    Deferred.prototype._fulfill = function(type, result) {
      var fulfillment, _then;
      if (this._fulfillment) {
        return typeof console !== "undefined" && console !== null ? typeof console.logWarning === "function" ? console.logWarning('Deferred::fulfill(type, result): Attempting to fulfill a promise that has already been fulfilled. Fulfillment ignored.') : void 0 : void 0;
      }
      if (result instanceof Promise) return result.then(this.resolve, this.reject);
      fulfillment = this._fulfillment = {
        type: type,
        result: result
      };
      if (_then = this._then) return _then["do"](type, result);
    };

    return Deferred;

  })();

  Promise = (function() {

    function Promise(deferred) {
      if (deferred instanceof Deferred === false) {
        throw "Promise::constructor(deferred): deferred paramter must be defined and of type Deferred.";
      }
      this._deferred = deferred;
      this.isPromise = true;
    }

    Promise.prototype.then = function(success, failure) {
      return this._deferred.setThen(success, failure);
    };

    return Promise;

  })();

  Then = (function() {

    function Then(success, failure) {
      this.deferred = new Deferred();
      this.promise = this.deferred.promise;
      this._callbacks = {
        resolve: success,
        reject: failure
      };
    }

    Then.prototype["do"] = function(type, value) {
      var callback, callbacks, deferred, result;
      deferred = this.deferred;
      callbacks = this._callbacks;
      try {
        callback = callbacks[type];
        if (!callback) return deferred.reject(value);
        result = callback(value);
        if (result instanceof Promise) {
          return result.then(deferred.resolve, deferred.reject);
        } else {
          switch (type) {
            case type === "resolve":
              return deferred.resolve(result);
            case type === "reject":
              return deferred.reject(result);
          }
        }
      } catch (error) {
        return deferred.reject(error);
      }
    };

    return Then;

  })();

  async = {
    call: function(value, context, args) {
      var deferred;
      deferred = new Deferred();
      try {
        if (value.then) {
          if (value instanceof Promise) return value;
          value.then(deferred.resolve, deferred.reject);
        } else {
          if (toType(value) === "Function") {
            value = value.apply(context || {}, args || []);
          }
          deferred.resolve(value);
        }
      } catch (error) {
        deferred.reject(error);
      }
      return deferred.promise;
    },
    defer: function() {
      return new Deferred();
    },
    promisify: function(nodeasyncFunction, context) {
      return function() {
        var args, deferred;
        deferred = async.defer();
        args = Array.prototype.slice.call(arguments);
        args.push(function(err, val) {
          if (err !== null) return deferred.reject(err);
          return deferred.resolve(val);
        });
        nodeasyncFunction.apply(context || {}, args);
        return deferred.promise;
      };
    },
    forEach: function(array, func) {
      var applyFunction, deferred, i, item, _len;
      deferred = async.defer();
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        array[i] = applyFunction(item);
      }
      async.parallel(array).then(deferred.resolve, deferred.reject);
      return deferred.promise;
    },
    forEachSeries: function(array, func) {
      var applyFunction, deferred, i, item, _len;
      deferred = async.defer();
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        array[i] = applyFunction(item);
      }
      async.series(array).then(deferred.resolve, deferred.reject);
      return deferred.promise;
    },
    map: function(array, func) {
      var applyFunction, deferred, i, item, _len;
      deferred = async.defer();
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        array[i] = applyFunction(item);
      }
      async.parallel(array).then(deferred.resolve, deferred.reject);
      return deferred.promise;
    },
    mapSeries: function(array, func) {
      var applyFunction, deferred, i, item, _len;
      deferred = async.defer();
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        array[i] = applyFunction(item);
      }
      async.series(array).then(deferred.resolve, deferred.reject);
      return deferred.promise;
    },
    filter: function(array, func) {
      var applyFunction, deferred, filterResults, i, item, tasks, _len,
        _this = this;
      deferred = async.defer();
      tasks = [];
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      filterResults = function(results) {
        var filtered, i, result, _len;
        filtered = [];
        for (i = 0, _len = results.length; i < _len; i++) {
          result = results[i];
          if (result) filtered.push(array[i]);
        }
        return deferred.resolve(filtered);
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        tasks.push(applyFunction(item));
      }
      async.parallel(tasks).then(filterResults, deferred.reject);
      return deferred.promise;
    },
    filterSeries: function(array, func) {
      var applyFunction, deferred, filterResults, i, item, tasks, _len,
        _this = this;
      deferred = async.defer();
      tasks = [];
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      filterResults = function(results) {
        var filtered, i, result, _len;
        filtered = [];
        for (i = 0, _len = results.length; i < _len; i++) {
          result = results[i];
          if (result) filtered.push(array[i]);
        }
        return deferred.resolve(filtered);
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        tasks.push(applyFunction(item));
      }
      async.series(tasks).then(filterResults, deferred.reject);
      return deferred.promise;
    },
    reject: function(array, func) {
      var applyFunction, deferred, filterResults, i, item, tasks, _len,
        _this = this;
      deferred = async.defer();
      tasks = [];
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      filterResults = function(results) {
        var filtered, i, result, _len;
        filtered = [];
        for (i = 0, _len = results.length; i < _len; i++) {
          result = results[i];
          if (!result) filtered.push(array[i]);
        }
        return deferred.resolve(filtered);
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        tasks.push(applyFunction(item));
      }
      async.parallel(tasks).then(filterResults, deferred.reject);
      return deferred.promise;
    },
    rejectSeries: function(array, func) {
      var applyFunction, deferred, filterResults, i, item, tasks, _len,
        _this = this;
      deferred = async.defer();
      tasks = [];
      applyFunction = function(item) {
        return function() {
          return func(item);
        };
      };
      filterResults = function(results) {
        var filtered, i, result, _len;
        filtered = [];
        for (i = 0, _len = results.length; i < _len; i++) {
          result = results[i];
          if (!result) filtered.push(array[i]);
        }
        return deferred.resolve(filtered);
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        tasks.push(applyFunction(item));
      }
      async.series(tasks).then(filterResults, deferred.reject);
      return deferred.promise;
    },
    detect: function(array, func) {
      var deferred, item, resolveCallback, result, tasks, _i, _len;
      deferred = async.defer();
      tasks = [];
      resolveCallback = function(item) {
        return function(result) {
          if (deferred.isFulfilled()) return;
          if (result) return deferred.resolve(item);
        };
      };
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if (deferred.isFulfilled()) break;
        try {
          result = func(item);
          if (result instanceof Promise) {
            result.then(resolveCallback(item), deferred.reject);
          } else {
            resolveCallback(item)(result);
          }
        } catch (error) {
          deferred.reject(error);
        }
      }
      return deferred.promise;
    },
    detectSeries: function(array, func) {
      var currentIndex, deferred, doStep, resolveCallback;
      deferred = async.defer();
      currentIndex = 0;
      resolveCallback = function(result) {
        if (result) {
          return deferred.resolve(array[currentIndex]);
        } else {
          currentIndex += 1;
          if (currentIndex === array.length) return deferred.resolve(void 0);
          return doStep(currentIndex);
        }
      };
      doStep = function(index) {
        return async.call(func(array[index])).then(resolveCallback, deferred.reject);
      };
      doStep(currentIndex);
      return deferred.promise;
    },
    series: function(tasks, options) {
      var deferred, failCallback, failed, promise, resolveCallback, results, task, _i, _len;
      results = [];
      deferred = new Deferred();
      failed = false;
      resolveCallback = function(func) {
        return function(result) {
          results.push(result);
          if (func === void 0) deferred.resolve(results);
          return func(result);
        };
      };
      failCallback = function(err) {
        if (failed) return;
        failed = true;
        return deferred.reject(err);
      };
      try {
        options = options || {};
        promise = async.call(tasks.shift(), options.context || {}, options.arguments || []);
      } catch (error) {
        failCallback(error);
      }
      for (_i = 0, _len = tasks.length; _i < _len; _i++) {
        task = tasks[_i];
        promise = promise.then(resolveCallback(task), failCallback);
      }
      promise.then(resolveCallback(), failCallback);
      return deferred.promise;
    },
    parallel: function(tasks, options) {
      var addResult, deferred, failCallback, i, resolveCallback, result, results, task, tasksComplete, _len;
      results = [];
      deferred = new Deferred();
      tasksComplete = 0;
      addResult = function(index, result) {
        var i, _ref, _results;
        if (index >= results.length) {
          _results = [];
          for (i = _ref = results.length; i <= index; i += 1) {
            if (i !== index) {
              _results.push(results.push(void 0));
            } else {
              _results.push(results.push(result));
            }
          }
          return _results;
        } else {
          return results[index] = result;
        }
      };
      resolveCallback = function(i) {
        return function(result) {
          if (deferred.isFulfilled()) return;
          addResult(i, result);
          tasksComplete++;
          if (tasksComplete === tasks.length) return deferred.resolve(results);
        };
      };
      failCallback = function(err) {
        if (deferred.isFulfilled()) return;
        return deferred.reject(err);
      };
      for (i = 0, _len = tasks.length; i < _len; i++) {
        task = tasks[i];
        if (deferred.isFulfilled()) break;
        try {
          result = task();
          if (result instanceof Promise) {
            result.then(resolveCallback(i), failCallback);
          } else {
            resolveCallback(i)(result);
          }
        } catch (error) {
          failCallback(error);
        }
      }
      return deferred.promise;
    }
  };

  if (typeof window !== "undefined" && window !== null) window.async = async;

  if (typeof module !== "undefined" && module !== null) module.exports = async;

}).call(this);
