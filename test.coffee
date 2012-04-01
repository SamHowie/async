async     = require "./async"

# Task Definitions
task_01 = () ->
  deferred = async.defer()
  setTimeout(
    () ->
      deferred.resolve 'Task 01'
    , 500
  )
  return deferred.promise

task_02 = () ->
  deferred = async.defer()
  setTimeout(
    () ->
      deferred.resolve 'Task 02'
    , 100
  )
  return deferred.promise

task_03 = () ->
  deferred = async.defer()
  setTimeout(
    () ->
      deferred.resolve 'Task 03'
    , 115
  )
  return deferred.promise

task_04 = () ->
  deferred = async.defer()
  setTimeout(
    () ->
      deferred.resolve 'Task 04'
    , 510
  )
  return deferred.promise

task_fail = () ->
  deferred = async.defer()
  setTimeout(
    () ->
      deferred.reject 'successful failure'
    , 500
  )
  return deferred.promise

task_with_value = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      deferred.resolve value
    , 2000
  )
  return deferred.promise

double = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      return deferred.reject 'successful failure' if typeof value is 'string'
      deferred.resolve 2 * value
    , 500
  )
  return deferred.promise

isEven = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      return deferred.reject 'successful failure' if typeof value is 'string'
      deferred.resolve result = (if (value % 2 is 0) then true else false)
    , 500
  )
  return deferred.promise

step1 = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      value.push('step1')
      deferred.resolve value
    , 500
  )
  return deferred.promise

step2 = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      value.push('step2')
      deferred.resolve value
    , 500
  )
  return deferred.promise

step3 = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      value.push('step3')
      deferred.resolve value
    , 500
  )
  return deferred.promise

step4 = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      value.push('step4')
      deferred.resolve value
    , 500
  )
  return deferred.promise

step_fail = (value) ->
  deferred = async.defer()
  setTimeout(
    () ->
      value.push('rejected!')
      deferred.reject value
    , 500
  )
  return deferred.promise

# ------------------------------------------------------------------------------------------ SERIES TESTS
# Series - ascync steps
async.series([task_01, task_02, task_03, task_04]).then((result) -> console.log result)

# Series - mix of async and sync steps (sync step last)
async.series([task_01,task_02, ((result) -> return "Task 03 (sync)")])
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
async.series([task_with_value], {arguments:["Task 01 (passed value)"]})
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

# ------------------------------------------------------------------------------- GITHUB EXAMPLES TESTS
async.call(step1([]))
.then(step2)
.then(step3)
.then(step4)
.then(
  (result) -> console.log result,
  (error) -> console.log error
)

async.call(step1([]))
.then(step2)
.then(step_fail)
.then(step4)
.then(
  (result) -> console.log result,
  (error) -> console.log error
)

async.series([
    step1([]),
    step2,
    step3,
    step4
])
.then(
  (results) -> console.log results[3],
  (error) -> console.log error
);

async.series([
    step1([]),
    step_fail,
    step3,
    step4
])
.then(
  (results) -> console.log results[3],
  (error) -> console.log error
);

