
/*
# Tests
doSomethingasync = () ->
  deferred = new Deferred()
  setTimeout(
    () ->
      deferred.resolve 'Hello World'
    , 1500
  )
  return deferred.promise

doSomethingElseasync = () ->
  deferred = new Deferred()
  setTimeout(
    () ->
      deferred.resolve doSomethingasync()
    , 500
  )
  return deferred.promise

doSomethingElseasync().then (val) ->
  console.log 'Promise Resolved!', val
*/

(function() {
  var async, fs, getFileData, logFileDataForFiles, logResult, readdir_promise, stat_promise;

  fs = require("fs");

  async = require("./async");

  readdir_promise = async.promisify(fs.readdir);

  stat_promise = async.promisify(fs.stat);

  /*
  # Print File Data in Directory
  readdir_promise('./').then(
    (files) ->
      for file in files
        do (file) ->
          stat_promise(file).then (stats) -> 
            console.log "File #{file} is #{stats.size} bytes."
  )
  */

  /*
  # Print file data in directory
  printFileData = (file) ->
    deferred = async.defer()
    stat_promise(file).then (stats) -> 
      deferred.resolve(console.log "File #{file} is #{stats.size} bytes.")
    return deferred.promise
  readdir_promise('./').then(
    (files) -> async.forEach files, printFileData
  )
  readdir_promise('./').then(
    (files) -> async.forEachSeries files, printFileData
  )
  */

  getFileData = function(file) {
    var deferred;
    deferred = async.defer();
    stat_promise(file).then(function(stats) {
      return deferred.resolve("File " + file + " is " + stats.size + " bytes.");
    });
    return deferred.promise;
  };

  /*
  readdir_promise('./').then(
    (files) -> async.map(files, getFileData).then (result) -> console.log result
  )
  */

  logFileDataForFiles = function(files) {
    return async.mapSeries(files, getFileData).then(logResult);
  };

  logResult = function(result) {
    return console.log(result);
  };

  readdir_promise('./').then(logFileDataForFiles);

}).call(this);
