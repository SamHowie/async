toType = (object) ->
  if object is null
    result = "null"
  else if object is undefined
     result = "undefined"
  else
    result = Object.prototype.toString.call(object).slice(8, -1)

class Deferred
  constructor: () ->
    # Public properties
    @promise      = new Promise(this)

    # Private Properties
    @_fulfillment = undefined
    @_then        = undefined

  isFulfilled: ->
    return @_fulfillment?

  setThen: (success, failure) =>
    _then = @_then = new Then success, failure
    _then.do(fulfillment.type, fulfillment.result) if fulfillment = @_fulfillment
    return _then.promise

  resolve: (result) =>
    @_fulfill('resolve', result)

  reject: (result) =>
    @_fulfill 'reject', result

  _fulfill: (type, result) ->
    if @_fulfillment then return console?.logWarning? 'Deferred::fulfill(type, result): Attempting to fulfill a promise that has already been fulfilled. Fulfillment ignored.'

    if (result instanceof Promise)
      return result.then @resolve, @reject # promise is not fulfilled until result is no longer a promise

    fulfillment = @_fulfillment = {type: type, result: result}
    _then.do(type, result) if _then = @_then
        

class Promise
  constructor: (deferred) ->
    throw "Promise::constructor(deferred): deferred paramter must be defined and of type Deferred." if deferred instanceof Deferred is false
    # Private Properties
    @_deferred = deferred
    @isPromise = true

  then: (success, failure) ->
    return @_deferred.setThen success, failure

class Then
  constructor: (success, failure) ->
    @deferred = new Deferred()
    @promise = @deferred.promise
    @_callbacks = {resolve: success, reject: failure}

  do: (type, value) ->
    deferred = @deferred
    callbacks = @_callbacks
    try
      callback = callbacks[type]
      return deferred.reject value if !callback
      result = callback value
      if result instanceof Promise
        result.then deferred.resolve, deferred.reject
      else
        switch type
          when type is "resolve" then deferred.resolve result
          when type is "reject" then deferred.reject result
    catch error
      deferred.reject error

async =
  # turns value into a promise
  call: (value, context, args) ->
    deferred = new Deferred()

    try
      if value.then
        return value if value instanceof Promise
        value.then deferred.resolve, deferred.reject # making assumption that value is a promise from another async library
      else 
        if toType(value) is "Function"
          value = value.apply (context || {}), (args || [])
        deferred.resolve value

    catch error
      deferred.reject error

    return deferred.promise

  # Returns a deferred for making promises
  defer: () ->
    return new Deferred()

  # Takes an async nodejs library function and returns a promisified function (a function that returns a promise).
  promisify: (nodeasyncFunction, context) ->
    return () ->
      deferred = async.defer()
      args = Array.prototype.slice.call arguments

      args.push (err, val) ->
        if err isnt null
          return deferred.reject err
        return deferred.resolve val

      nodeasyncFunction.apply context || {}, args

      return deferred.promise

  # Collections
  # NOTE: func must return a promise if it is an async function
  # returns promise
  forEach: (array, func) ->
    deferred      = async.defer()

    applyFunction = (item) ->
      return ->
        func item

    for item, i in array
      array[i] = applyFunction item

    async.parallel(array).then deferred.resolve, deferred.reject

    return deferred.promise

  forEachSeries: (array, func) ->
    deferred      = async.defer()

    applyFunction = (item) ->
      return ->
        func item

    for item, i in array
      array[i] = applyFunction item

    async.series(array).then deferred.resolve, deferred.reject

    return deferred.promise

  map: (array, func) ->
    deferred      = async.defer()

    applyFunction = (item) ->
      return ->
        func item

    for item, i in array
      array[i] = applyFunction item

    async.parallel(array).then deferred.resolve, deferred.reject

    return deferred.promise

  mapSeries: (array, func) ->
    deferred      = async.defer()

    applyFunction = (item) ->
      return ->
        func item

    for item, i in array
      array[i] = applyFunction item

    async.series(array).then deferred.resolve, deferred.reject

    return deferred.promise

  filter: (array, func) ->
    deferred      = async.defer()
    tasks         = []

    applyFunction = (item) ->
      return ->
        func item

    filterResults = (results) =>
      filtered = []
      for result, i in results
        filtered.push(array[i]) if result
      deferred.resolve filtered

    for item, i in array
      tasks.push(applyFunction item)

    async.parallel(tasks).then filterResults, deferred.reject

    return deferred.promise

  filterSeries: (array, func) ->
    deferred      = async.defer()
    tasks         = []

    applyFunction = (item) ->
      return ->
        func item

    filterResults = (results) =>
      filtered = []
      for result, i in results
        filtered.push(array[i]) if result
      deferred.resolve filtered

    for item, i in array
      tasks.push(applyFunction item)

    async.series(tasks).then filterResults, deferred.reject

    return deferred.promise

  reject: (array, func) ->
    deferred      = async.defer()
    tasks         = []

    applyFunction = (item) ->
      return ->
        func item

    filterResults = (results) =>
      filtered = []
      for result, i in results
        filtered.push(array[i]) if !result
      deferred.resolve filtered

    for item, i in array
      tasks.push(applyFunction item)

    async.parallel(tasks).then filterResults, deferred.reject

    return deferred.promise

  rejectSeries: (array, func) ->
    deferred      = async.defer()
    tasks         = []

    applyFunction = (item) ->
      return ->
        func item

    filterResults = (results) =>
      filtered = []
      for result, i in results
        filtered.push(array[i]) if !result
      deferred.resolve filtered

    for item, i in array
      tasks.push(applyFunction item)

    async.series(tasks).then filterResults, deferred.reject

    return deferred.promise

  detect: (array, func) ->
    deferred      = async.defer()
    tasks         = []

    resolveCallback = (item) ->
      return (result) ->
        return if deferred.isFulfilled()
        deferred.resolve item if result

    for item in array
      break if deferred.isFulfilled()
      try
        result = func item
        if result instanceof Promise
          result.then resolveCallback(item), deferred.reject
        else
          resolveCallback(item) result 
      catch error
        deferred.reject error

    return deferred.promise

  detectSeries: (array, func) ->
    deferred      = async.defer()
    currentIndex  = 0

    resolveCallback = (result) ->
      if result
        deferred.resolve array[currentIndex] 
      else
        currentIndex += 1
        return deferred.resolve undefined if currentIndex is array.length
        doStep currentIndex

    doStep = (index) ->
      async.call(func array[index]).then resolveCallback, deferred.reject

    doStep currentIndex

    return deferred.promise


  # Flow Control
  series: (tasks, options) ->
    results       = []
    deferred      = new Deferred()
    failed        = false

    resolveCallback = (func) ->
      return (result) ->
        results.push result
        deferred.resolve results if func is undefined
        return func(result)

    failCallback = (err) ->
      return if failed
      failed = true
      deferred.reject err

    try
      options = options || {}
      promise = async.call tasks.shift(), (options.context || {}), (options.arguments || [])
    catch error
      failCallback error # Handles case where first task is sync and causes an error

    for task in tasks
      promise = promise.then resolveCallback(task), failCallback
    promise.then resolveCallback(), failCallback

    return deferred.promise

  parallel: (tasks, options) ->
    results         = []
    deferred        = new Deferred()
    tasksComplete   = 0

    addResult = (index, result) ->
      if index >= results.length
        for i in [results.length..index] by 1
          if i isnt index then results.push(undefined) else results.push(result)
      else
        results[index] = result

    resolveCallback = (i) ->
      return (result) ->
        return if deferred.isFulfilled()
        addResult i, result
        tasksComplete++
        deferred.resolve(results) if tasksComplete is tasks.length

    failCallback = (err) ->
      return if deferred.isFulfilled()
      deferred.reject err

    for task, i in tasks
      break if deferred.isFulfilled()
      try
        result = task()
        if result instanceof Promise
          result.then resolveCallback(i), failCallback
        else
          resolveCallback(i) result
      catch error
        failCallback error

    return deferred.promise


# Export for browser
window?.async = async

# Export for CommonJS
module?.exports = async

