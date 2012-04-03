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
* [promisifyNode](#promisifyNode)

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

#### Example

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
### call(func, context, ...)

Takes a synchronous function and returns a promise of its return value.

#### Arguments

* func      - Synchronous function to be called.
* context   - Context to be applied to the function being called.
* ...       - arguments to be passed to the function being called.

#### Example

    async.call(function(x){return x * 2;}, undefined, 2)
    .then(function(result) {
        console.log(result); // 4
    });

<a name="promisify" />
### promisify(value)

Takes a value and converts it into a promise.

#### Arguments

* value - Value to be converted.

If value is a promise, the promise is simply returned.
If value is a function, the function is executed and the result is converted.

Note: Asynchronous functions are not supported. If you want to promisfy an asynchronous function written in nodejs callback style please use promisifyNode

#### Example

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
### promisifyNode(asyncFunction, context)

Takes a node style asynchronous function and converts it into a function that returns a promise.

#### Arguments

* asyncFunction   - A node style asynchronous function.
* context         - The context of the asynchronous function (defaults to {}). 

#### Example

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

Applies an asynchronous function to each element in an array, in parallel.

#### Arguments

* array - Array of items to be operated upon.
* func  - function to apply to each element in array.

#### Example

    // Double each element in the array.
    // All promises will be fulfilled at the same time.
    async.forEach([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            console.log(x + " x 2 = " + (x * 2));
            return deferred.resolve();
        }, 200);
        return deferred.promise;
    });

### forEachSeries (array, func)

Applies an asynchronous function to each element in an array, in series.

#### Arguments

* array - Array to have function applied to.
* func  - function to apply to each element in array.

#### Example

    // Double each element in the array.
    // Each promise will be fulfilled at 200 millisecond intervals.
    async.forEachSeries([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            console.log(x + " x 2 = " + (x * 2));
            return deferred.resolve();
        }, 200);
        return deferred.promise;
    });

<a name="map" />
### map(array, func)

Applies an asynchronous function to each element in an array, in parallel. Promises to return a new array of the results of each operation.

#### Arguments

* array - Array of items to be operated upon.
* func  - function to apply to each element in array.

#### Example

    // Double each element in the array.
    // All promises will be fulfilled at the same time.
    async.map([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve(x * 2);
        }, 200);
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // [2,4,6,8]
    });

### mapSeries (array, func)

Applies an asynchronous function to each element in an array, in series. Promises to return a new array of the results of each operation.

#### Arguments

* array - Array of items to be operated upon.
* func  - function to apply to each element in array.

#### Example

    // Double each element in the array.
    // Each promise will be fulfilled at 200 millisecond intervals.
    async.mapSeries([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve(x * 2);
        }, 200);
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // [2,4,6,8]
    });

<a name="filter" />
### filter(array, func)

Filters out elements of an array that do not pass a validation check, in parallel. Promises to return a new array of the elements that passed validation.

#### Arguments

* array - Array of items to be operated upon.
* func  - Validation function to apply to each element in array.

#### Example

    // Filter out all odd numbers from an array.
    // All promises will be fulfilled at the same time.
    async.filter([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve((x % 2 === 0) ? true : false);
        }, 200);
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // [2,4]
    });

### filterSeries (array, func)

Filters out elements of an array that do not pass a validation check, in series. Promises to return a new array of the elements that passed validation.

#### Arguments

* array - Array of items to be operated upon.
* func  - Validation function to apply to each element in array.

#### Example

    // Filter out all odd numbers from an array.
    // Each promise will be fulfilled at 200 millisecond intervals.
    async.filterSeries([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve((x % 2 === 0) ? true : false);
        }, 200);
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // [2,4]
    });

<a name="reject" />
### reject(array, func)

The opposite of filter. Reject filters out elements of an array that pass a validation check, in parallel. Promises to return a new array of the elements that failed validation.

#### Arguments

* array - Array of items to be operated upon.
* func  - Validation function to apply to each element in array.

#### Example

    // Reject all even numbers in an array.
    // All promises will be fulfilled at the same time.
    async.reject([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve((x % 2 === 0) ? true : false);
        }, 200);
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // [1,3]
    });

### rejectSeries (array, func)

The opposite of filter. RejectSeries filters out elements of an array that pass a validation check, in series. Promises to return a new array of the elements that failed validation.

#### Arguments

* array - Array of items to be operated upon.
* func  - Validation function to apply to each element in array.

#### Example

    // Reject all even numbers in an array.
    // Each promise will be fulfilled at 200 millisecond intervals.
    async.rejectSeries([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve((x % 2 === 0) ? true : false);
        }, 200);
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // [1,3]
    });


<a name="detect" />
### detect(array, func)

Promises to return the first element in the array that passes a validation test, in parallel. 
If order of validation checks are important, please use detectSeries.

#### Arguments

* array - Array of items to be operated upon.
* func  - Validation function to apply to each element in array.

#### Example

    // Detect first number to be found even in array.
    async.detect([1,2,3,4,5], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve((x % 2 === 0) ? true : false);
        }, 1000 / x); // Promises later in the array will be fulfilled first
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // 4
    });

### detectSeries (array, func)

Promises to return the first element in the array that passes a validation test, in series.
Use this if order of tests are important.

#### Arguments

* array - Array of items to be operated upon.
* func  - Validation function to apply to each element in array.

#### Example

    // Detect first number to be found even in array.
    async.detectSeries([1,2,3,4], function(x) {
        var deferred = async.defer();
        setTimeout(function() {
            return deferred.resolve((x % 2 === 0) ? true : false);
        }, 200);
        return deferred.promise;
    })
    .then(function(results){
        console.log(results); // 2
    });

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