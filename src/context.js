import {cacheQueryResult, queryCache} from 'graphql-cache'
import {EventEmitter} from 'events'

export function createGraphQLContext(opts = {}) {

  const events = new EventEmitter()

  function updateCache(newCache) {
    context.cache = newCache
    context.events.emit('cacheUpdated')
  }

  function runQuery(query, variables) {
    return opts.executeQuery(query, variables)
    .then(result => {
      updateCache(cacheQueryResult(context.cache, query, result.data, variables))
    })
  }

  function _queryCache(query, variables) {
    return queryCache(context.cache, query, variables)
  }

  const context = {
    opts,
    cache: {},
    runQuery,
    queryCache: _queryCache,
    events,
  }

  return context
}
