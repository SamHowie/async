# Async

A utility module for asynchronous javascript on the client and the server. Async uses promises to mitigate the **"Pyramid of Doom"** effect.

Inspired by Caolan McMahon's [async](https://github.com/caolan/async) and Kristopher Michael Kowal's [q](http://github.com/kriskowal/q).

Turn this (example sourced from [q](http://github.com/kriskowal/q)):

    step1(function (value1) {
        step2(value1, function(value2) {
            step3(value2, function(value3) {
                step4(value3, function(value4) {
                    // Do something with result of step4
                });
            });
        });
    });

Into this:

    async.call(step01, undefined, value1)
    .then(step2)
    .then(step3)
    .then(step4)
    .then(function (result) {
        // Do something with result of step 4
    }, function (error) {
        // Handle any error from step 1 to step 4
    });

Or this:

    async.series([
        step1(value1),
        step2,
        step3,
        step4
    ])
    .then(function (results) {
        var result_of_step4 = results[3];
        // Do something with result of step 4
    }, function (error) {
        // Handle any error from step 1 to step 4
    });

### Utilities include:
* Asynchronous functional operations on collections (forEach, map, filter…).
* Asynchronous control flow (series, parallel…).
* Shortcut to turn node.js library functions into promise returning functions

## Documentation

### Utilities

* [defer](#defer)
* [call](#call)
* [promisify](#promisify)
* [promisifyNodeJS](#promisifyNodeJS)

### Functional Operations

* [forEach](#forEach)
* [map](#map)
* [filter](#filter)
* [reject](#reject)
* [detect](#detect)

### Control Flow

* [series](#series)
* [parallel](#parallel)

## Utilities

<a name="defer" />
### defer()

Returns a deferred object for creating custom async tasks.

    // This example shows how a deferred object can be used to create an async task.
    // Upon execution of the task, a promise is returned. 
    // The task performs an asynchronous wait of 500 milliseconds before fulfilling the promise.

    asyncTask = function() {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve('Hello Promises!');
        }, 500);
        return deferred.promise;
    };

<a name="call" />
### call(value, context, args)

Takes a synchronous function and returns a promise of its return value.

    async.call(function(x){return x * 2;}, undefined, 2)
    .then(function(result) {
        console.log(result); // 4
    });

<a name="promisify" />
### promisify(value)

Takes a value and converts it into a promise.

If value is a promise, the promise is simply returned.

If value is a function, the function is executed and the result is converted.

Note: Asynchronous functions are not supported. If you want to promisfy an asynchronous function written in nodejs callback style please use promisifyNode

    // Promisify a string.
    async.promisify("peanut butter")
    .then(function(result) {
        console.log(result); // Peanut Butter
    });

    // Promisify an object.
    async.promisify({spread: "vegemite"})
    .then(function(result) {
        console.log(result.spread); // vegemite
    });

    // Promisify a function.
    async.promisify(function(){return "Honey"})
    .then(function(result) {
        console.log(result); // Honey
    });

<a name="promisifyNode" />
### promisifyNodeJS(asyncFunction, context)

Takes a node style asynchronous function and converts it into a function that returns a promise.

asyncFunction   - A node style asynchronous function
context         - The context of the asynchronous function (defaults to {})

    // Promisify nodejs fs.readdir and fs.stats
    // Use these promisified tasks to print a list of file data for files in the current directory.
    var fs      = require('fs'),
        readdir = async.promisifyNode(fs.readdir),
        stat    = async.promisifyNode(fs.stat);

    readdir("./")
    .then(function(files) {
        var deferred = async.defer();
        async.map(files, function(file) {
            var deferred = async.defer();
            stat(file)
            .then(function(stats) {
                deferred.resolve("The file " + file + " is " + stats.size + " bytes.");
            });
            return deferred.promise;
        })
        .then(function(results) {
            deferred.resolve(results);
        });
        return deferred.promise;
    })
    .then(function(results){
        var i;
        for (i = 0; i < results.length; i++) {
            console.log(results[i]);
        }
    });


## Functional Operations

<a name="forEach" />
### forEach(array, func)

### forEachSeries (array, func)

<a name="map" />
### map(array, func)

### mapSeries (array, func)

<a name="filter" />
### filter(array, func)

### filterSeries (array, func)

<a name="reject" />
### reject(array, func)

### rejectSeries (array, func)

<a name="detect" />
### detect(array, func)

### detectSeries (array, func)

## Control Flow

<a name="series" />
### series(tasks)

<a name="parallel" />
### parallel (tasks)

## Issues?

Feel free to shoot me a message!

## License (MIT)

Copyright 2012 Sam Howie. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.