(function() {
  var Deferred, Promise, async,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Deferred = (function() {

    function Deferred() {
      this.progress = __bind(this.progress, this);
      this.reject = __bind(this.reject, this);
      this.resolve = __bind(this.resolve, this);      this.promise = new Promise(this);
      this._pending = [];
      this._fulfillment = void 0;
    }

    Deferred.prototype.append = function(success, failure, progress) {
      var callback, fulfillment, _name;
      fulfillment = this._fulfillment;
      callback = {
        resolve: success,
        reject: failure,
        progress: progress
      };
      if (this._fulfillment && this._fulfillment.result instanceof Promise === false) {
        if (typeof callback[_name = fulfillment.type] === "function") {
          callback[_name](fulfillment.result);
        }
        return this;
      }
      this._pending.push(callback);
      return this;
    };

    Deferred.prototype.resolve = function(result) {
      return this._fulfill('resolve', result);
    };

    Deferred.prototype.reject = function(result) {
      return this._fulfill('reject', result);
    };

    Deferred.prototype.progress = function(result) {
      var callback, _i, _len, _results;
      if (fulfillment) {
        if (typeof console !== "undefined" && console !== null) {
          console.logWarning('Deferred::complete(result): Attempting to progressback a promise that has been fulfilled.');
        }
        return;
      }
      _results = [];
      for (_i = 0, _len = pending.length; _i < _len; _i++) {
        callback = pending[_i];
        if (callback["progress"] != null) {
          _results.push(callback["progress"](result));
        }
      }
      return _results;
    };

    Deferred.prototype._fulfill = function(type, result) {
      var callback, pending;
      if (this._fulfillment) {
        return typeof console !== "undefined" && console !== null ? typeof console.logWarning === "function" ? console.logWarning('Deferred::fulfill(type, result): Attempting to fulfill a promise that has already been fulfilled. Fulfillment ignored.') : void 0 : void 0;
      }
      if (result instanceof Promise) {
        return result.then(this.resolve, this.reject, this.progress);
      }
      this._fulfillment = {
        type: type,
        result: result
      };
      pending = this._pending;
      while (pending[0]) {
        callback = pending.shift()[type];
        if (typeof callback === 'function') callback(result);
      }
    };

    return Deferred;

  })();

  Promise = (function() {

    function Promise(deferred) {
      this._deferred = deferred;
    }

    Promise.prototype.then = function(success, failure, progress) {
      if (this._deferred === void 0) return this;
      this._deferred.append(success, failure, progress);
      return this;
    };

    return Promise;

  })();

  async = {
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
      var deferred, funcIsPromise, item, numItems, onFuncComplete, promise, returnedItems, _i, _len;
      deferred = async.defer();
      numItems = array.length;
      returnedItems = 0;
      funcIsPromise = void 0;
      onFuncComplete = function() {
        returnedItems += 1;
        if (returnedItems === numItems) return deferred.resolve();
      };
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        promise = func(item);
        if (funcIsPromise === void 0) funcIsPromise = promise instanceof Promise;
        if (funcIsPromise) {
          promise.then(onFuncComplete);
        } else {
          onFuncComplete();
        }
      }
      return deferred.promise;
    },
    forEachSeries: function(array, func) {
      var currentIndex, deferred, doStep, funcIsPromise, numItems, onFuncComplete;
      deferred = async.defer();
      numItems = array.length;
      currentIndex = 0;
      funcIsPromise = void 0;
      onFuncComplete = function() {
        currentIndex++;
        if (currentIndex === numItems) return deferred.resolve();
        return doStep(currentIndex);
      };
      doStep = function(index) {
        var item, promise;
        item = array[index];
        promise = func(item);
        if (funcIsPromise === void 0) funcIsPromise = promise instanceof Promise;
        if (funcIsPromise) {
          return promise.then(onFuncComplete);
        } else {
          return onFuncComplete();
        }
      };
      doStep(currentIndex);
      return deferred.promise;
    },
    map: function(array, func) {
      var addResult, deferred, funcIsPromise, i, item, numToMap, results, _fn, _len;
      deferred = async.defer();
      numToMap = array.length;
      funcIsPromise = void 0;
      results = [];
      addResult = function(result, index) {
        var i, resultsLength, _results;
        resultsLength = results.length;
        if (index >= resultsLength) {
          _results = [];
          for (i = resultsLength; i <= index; i += 1) {
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
      _fn = function(item, i) {
        var onFuncComplete, result;
        onFuncComplete = function(result) {
          addResult(result, i);
          if (results.length === numToMap) return deferred.resolve(results);
        };
        result = func(item);
        if (funcIsPromise === void 0) funcIsPromise = result instanceof Promise;
        if (funcIsPromise) {
          return result.then(onFuncComplete, onFuncComplete);
        } else {
          return onFuncComplete(result);
        }
      };
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        _fn(item, i);
      }
      return deferred.promise;
    },
    mapSeries: function(array, func) {
      var currentIndex, deferred, doStep, funcIsPromise, numToMap, onFuncComplete, results;
      deferred = async.defer();
      numToMap = array.length;
      currentIndex = 0;
      funcIsPromise = void 0;
      results = [];
      onFuncComplete = function(result) {
        currentIndex++;
        results.push(result);
        if (currentIndex === numToMap) return deferred.resolve(results);
        return doStep(currentIndex);
      };
      doStep = function(index) {
        var item, result;
        item = array[index];
        result = func(item);
        if (funcIsPromise === void 0) funcIsPromise = result instanceof Promise;
        if (funcIsPromise) {
          return result.then(onFuncComplete);
        } else {
          return onFuncComplete(result);
        }
      };
      doStep(currentIndex);
      return deferred.promise;
    }
  };

  if (typeof window !== "undefined" && window !== null) window.async = async;

  if (typeof module !== "undefined" && module !== null) module.exports = async;

}).call(this);
