# Async

A utility module for asynchronous javascript on the client and the server. Async uses promises to mitigate the **"Pyramid of Doom"** effect.

Turn this (example sourced from [q]:(https://github.com/kriskowal/q)):
'''javascript
step1(function (value1) {
    step2(value1, function(value2) {
        step3(value2, function(value3) {
            step4(value3, function(value4) {
                // Do something with result of step4
            });
        });
    });
});
'''

Into this:
'''javascript
async.call(step01(value1))
.then(step2)
.then(step3)
.then(step4)
.then(function (result) {
	// Do something with result of step 4
}, function (error) {
	// Handle any error from step 1 to step 4
});
'''

Or this:
'''javascript
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
'''

### Utilities include:
* Asynchronous functional operations on collections (forEach, map, filter…).
* Asynchronous control flow (series, parallel…).
* Shortcut to turn node.js library functions into promise returning functions

## Documentation

Postponed due to rain.

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