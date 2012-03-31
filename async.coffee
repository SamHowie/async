class Deferred
  constructor: () ->
    # Public properties
    @promise = new Promise(this)

    # Private Properties
    @_pending = []
    @_fulfillment = undefined

  append: (success, failure, progress) ->
    fulfillment = @_fulfillment

    callback = {
      resolve: success,
      reject: failure,
      progress: progress
    }

    if @_fulfillment and @_fulfillment.result instanceof Promise is false
      callback[fulfillment.type]?(fulfillment.result)
      return this

    @_pending.push callback
    return this

  resolve: (result) =>
    @_fulfill('resolve', result)

  reject: (result) =>
    @_fulfill 'reject', result

  progress: (result) =>
    if fulfillment
      console?.logWarning 'Deferred::complete(result): Attempting to progressback a promise that has been fulfilled.'
      return
    callback["progress"](result) for callback in pending when callback["progress"]?

  _fulfill: (type, result) ->
    if @_fulfillment then return console?.logWarning? 'Deferred::fulfill(type, result): Attempting to fulfill a promise that has already been fulfilled. Fulfillment ignored.'

    if (result instanceof Promise)
      return result.then @resolve, @reject, @progress # Note promise has not been fulfilled yet

    @_fulfillment = {type: type, result: result}

    pending = @_pending
    while pending[0]
      callback = pending.shift()[type]
      callback(result) if typeof callback is 'function'
    return

class Promise
  constructor: (deferred) ->
    # Private Properties
    @_deferred = deferred

  then: (success, failure, progress) ->
    return this if @_deferred is undefined
    @_deferred.append success, failure, progress
    return this

async =
  defer: () ->
    return new Deferred()

  # Note you supply everything bar the callback to promisified functions
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
    numItems      = array.length
    returnedItems = 0
    funcIsPromise = undefined

    onFuncComplete = () ->
      returnedItems += 1
      deferred.resolve() if returnedItems is numItems

    for item in array
      promise = func item

      if funcIsPromise is undefined then funcIsPromise = promise instanceof Promise

      if funcIsPromise
        promise.then onFuncComplete
      else
        onFuncComplete()

    return deferred.promise

  # returns promise
  forEachSeries: (array, func) ->
    deferred      = async.defer()
    numItems      = array.length
    currentIndex  = 0
    funcIsPromise = undefined

    onFuncComplete = () ->
      currentIndex++
      return deferred.resolve() if currentIndex is numItems
      doStep currentIndex

    doStep = (index) ->
      item    = array[index]
      promise = func item

      if funcIsPromise is undefined then funcIsPromise = promise instanceof Promise

      if funcIsPromise
        promise.then onFuncComplete
      else
        onFuncComplete()

    doStep currentIndex

    return deferred.promise

  map: (array, func) ->
    deferred      = async.defer()
    numToMap      = array.length
    funcIsPromise = undefined
    results       = []

    addResult = (result, index) ->
      resultsLength = results.length
      if index >= resultsLength
        for i in [resultsLength..index] by 1
          if i isnt index then results.push undefined else results.push result
      else
        results[index] = result

    for item, i in array
      do (item, i) ->
        onFuncComplete = (result) ->
          addResult result, i
          deferred.resolve(results) if results.length is numToMap
        
        result = func item

        if funcIsPromise is undefined then funcIsPromise = result instanceof Promise

        if funcIsPromise
          result.then onFuncComplete, onFuncComplete
        else
          onFuncComplete(result)

    return deferred.promise

  mapSeries: (array, func) ->
    deferred      = async.defer()
    numToMap      = array.length
    currentIndex  = 0
    funcIsPromise = undefined
    results       = []

    onFuncComplete = (result) ->
      currentIndex++
      results.push result
      return deferred.resolve(results) if currentIndex is numToMap
      doStep currentIndex

    doStep = (index) ->
      item    = array[index]
      result = func item

      if funcIsPromise is undefined then funcIsPromise = result instanceof Promise

      if funcIsPromise
        result.then onFuncComplete
      else
        onFuncComplete(result)

    doStep currentIndex

    return deferred.promise



# Export for browser
window?.async = async

# Export for CommonJS
module?.exports = async

