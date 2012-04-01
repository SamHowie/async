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

  async.series([task_01, task_02, task_03, task_04]).then(function(result) {
    return console.log(result);
  });

  async.series([
    task_01, task_02, (function(result) {
      return "Task 03 (sync)";
    })
  ]).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.series([
    task_01, (function(result) {
      return "Task 02 (sync)";
    }), task_03
  ]).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.series([
    (function(result) {
      return "Task 01 (sync)";
    }), task_02, task_03
  ]).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.series([task_01, task_fail, task_03]).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.series([task_with_value], {
    arguments: ["Task 01 (passed value)"]
  }).then(function(result) {
    return console.log(result);
  });

  async.parallel([task_01, task_02, task_03, task_04]).then((function(result) {
    return console.log(result);
  }), (function(error) {
    return console.log(error);
  }));

  async.parallel([
    task_01, task_02, (function(result) {
      return "Task 03 (sync)";
    })
  ]).then((function(result) {
    return console.log(result);
  }), (function(error) {
    return console.log(error);
  }));

  async.parallel([
    task_01, (function(result) {
      return "Task 02 (sync)";
    }), task_03
  ]).then((function(result) {
    return console.log(result);
  }), (function(error) {
    return console.log(error);
  }));

  async.parallel([
    (function(result) {
      return "Task 01 (sync)";
    }), task_02, task_03
  ]).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.parallel([task_01, task_02, task_fail, task_04]).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.forEach([1, 2, 3, 4], double).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.forEach([1, 2, "alfred", 4], double).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.forEachSeries([1, 2, 3, 4], double).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.forEachSeries([1, 2, "alfred", 4], double).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.filter([1, 2, 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.filter([1, 2, "apples", 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.filterSeries([1, 2, 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.filterSeries([1, "oranges", 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.reject([1, 2, 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.reject([1, 2, "apples", 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.rejectSeries([1, 2, 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.rejectSeries([1, "oranges", 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.detect([1, 3, 5, 6], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.detect([1, "apples", 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.detect([2, "apples", 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.detectSeries([1, 3, 5, 6], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.detectSeries([1, "apples", 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.detectSeries([2, "apples", 3, 4], isEven).then((function(result) {
    return console.log(result);
  }), (function(err) {
    return console.log(err);
  }));

  async.call(step1([])).then(step2).then(step3).then(step4).then(function(result) {
    return console.log(result);
  }, function(error) {
    return console.log(error);
  });

  async.call(step1([])).then(step2).then(step_fail).then(step4).then(function(result) {
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
