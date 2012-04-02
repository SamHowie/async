(function() {
  var async, double, isEven, step1, step2, step3, step4, step_fail, task_01, task_02, task_03, task_04, task_fail, task_with_value;

  async = require("./async");

  task_01 = function() {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      return deferred.resolve('Task 01');
    }, 500);
    return deferred.promise;
  };

  task_02 = function() {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      return deferred.resolve('Task 02');
    }, 100);
    return deferred.promise;
  };

  task_03 = function() {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      return deferred.resolve('Task 03');
    }, 115);
    return deferred.promise;
  };

  task_04 = function() {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      return deferred.resolve('Task 04');
    }, 510);
    return deferred.promise;
  };

  task_fail = function() {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      return deferred.reject('successful failure');
    }, 500);
    return deferred.promise;
  };

  task_with_value = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      return deferred.resolve(value);
    }, 2000);
    return deferred.promise;
  };

  double = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      if (typeof value === 'string') return deferred.reject('successful failure');
      return deferred.resolve(2 * value);
    }, 500);
    return deferred.promise;
  };

  isEven = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      var result;
      if (typeof value === 'string') return deferred.reject('successful failure');
      return deferred.resolve(result = (value % 2 === 0 ? true : false));
    }, 500);
    return deferred.promise;
  };

  step1 = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      value.push('step1');
      return deferred.resolve(value);
    }, 500);
    return deferred.promise;
  };

  step2 = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      value.push('step2');
      return deferred.resolve(value);
    }, 500);
    return deferred.promise;
  };

  step3 = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      value.push('step3');
      return deferred.resolve(value);
    }, 500);
    return deferred.promise;
  };

  step4 = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      value.push('step4');
      return deferred.resolve(value);
    }, 500);
    return deferred.promise;
  };

  step_fail = function(value) {
    var deferred;
    deferred = async.defer();
    setTimeout(function() {
      value.push('rejected!');
      return deferred.reject(value);
    }, 500);
    return deferred.promise;
  };

  /*
  # ------------------------------------------------------------------------------------------ SERIES TESTS
  # Series - ascync steps
  async.series([task_01, task_02, task_03, task_04]).then((result) -> console.log result)
  
  # Series - mix of async and sync steps (sync step last)
  async.series([task_01, task_02, ((result) -> return "Task 03 (sync)")])
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # Series - mix of async and sync steps (sync middle last)
  async.series([task_01, ((result) -> return "Task 02 (sync)"), task_03])
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # Series - mix of async and sync steps (sync step first)
  async.series([((result) -> return "Task 01 (sync)"), task_02, task_03])
    .then(((result) -> console.log result), ((err) -> console.log err))
  # Series - step failure
  async.series([task_01, task_fail, task_03])
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # Series - arguments applied to first step
  async.series([task_with_value("Task 01 (passed value)")])
    .then((result) -> console.log result)
  
  # ---------------------------------------------------------------------------------------- PARALLEL TESTS
  # Parallel - async steps that finish at different times
  async.parallel([task_01, task_02, task_03, task_04])
    .then(((result) -> console.log result), ((error) -> console.log error))
  
  # Parallel - mix of async and sync steps (sync step last)
  async.parallel([task_01, task_02, ((result) -> return "Task 03 (sync)")])
    .then(((result) -> console.log result), ((error) -> console.log error))
  
  # Parallel - mix of async and sync steps (sync step middle)
  async.parallel([task_01, ((result) -> return "Task 02 (sync)"), task_03])
    .then(((result) -> console.log result), ((error) -> console.log error))
  
  # Parallel - mix of async and sync steps (sync step first)
  async.parallel([((result) -> return "Task 01 (sync)"), task_02, task_03])
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # Parallel - step failure
  async.parallel([task_01, task_02, task_fail, task_04])
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # ---------------------------------------------------------------------------------------- FOREACH TESTS
  async.forEach([1,2,3,4], double)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.forEach([1,2,"alfred",4], double)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.forEachSeries([1,2,3,4], double)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.forEachSeries([1,2,"alfred",4], double)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # ---------------------------------------------------------------------------------------- FILTER TESTS
  async.filter([1,2,3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.filter([1,2,"apples",4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.filterSeries([1,2,3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.filterSeries([1,"oranges",3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # ---------------------------------------------------------------------------------------- REJECT TESTS
  async.reject([1,2,3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.reject([1,2,"apples",4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.rejectSeries([1,2,3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.rejectSeries([1,"oranges",3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  # ---------------------------------------------------------------------------------------- DETECT TESTS
  async.detect([1,3,5,6], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.detect([1,"apples",3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.detect([2,"apples",3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.detectSeries([1,3,5,6], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.detectSeries([1,"apples",3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  
  async.detectSeries([2,"apples",3,4], isEven)
    .then(((result) -> console.log result), ((err) -> console.log err))
  */

  async.call(step1, void 0, []).then(step2).then(step3).then(step4).then(function(result) {
    return console.log(result);
  }, function(error) {
    return console.log(error);
  });

  async.call(step1, void 0, []).then(step2).then(step_fail).then(step4).then(function(result) {
    return console.log(result);
  }, function(error) {
    return console.log(error);
  });

  async.series([step1([]), step2, step3, step4]).then(function(results) {
    return console.log(results[3]);
  }, function(error) {
    return console.log(error);
  });

  async.series([step1([]), step_fail, step3, step4]).then(function(results) {
    return console.log(results[3]);
  }, function(error) {
    return console.log(error);
  });

}).call(this);
