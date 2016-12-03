import {
  cacheQueryResult,
  queryCache,
  passThroughQuery,
  normalizeEntitiesMiddleware,
  sessionValidationMiddleware,
} from 'graphql-cache'
import uuid from 'uuid'
import {EventEmitter} from 'events'

const DEFAULT_OPTS = {
  middleware: [normalizeEntitiesMiddleware],
  sessionId: uuid.v4(),
}

export function createGraphQLContext(userOpts = {}) {
  if (!userOpts.defaultRenderLoading) {
    throw new Error('createGraphQLContext(): defaultRenderLoading not provided')
  }

  if (!userOpts.defaultRenderError) {
    throw new Error('createGraphQLContext(): defaultRenderError not provided')
  }

  const opts = {
    ...userOpts,
    ...DEFAULT_OPTS,
  }

  const sessionMiddleware = sessionValidationMiddleware({
    sessionId: opts.sessionId,
  })

  console.log('Got session id', opts.sessionId)

  const middleware = [sessionMiddleware, ...opts.middleware]
  const initialCache = opts.initialCache || {}
  const events = new EventEmitter()

  function updateCache(newCache) {
    context.cache = newCache
    context.events.emit('cacheUpdated', newCache)
  }

  async function runQuery(query, variables) {
    return opts.executeQuery(query, variables)
    .then(result => {
      updateCache(cacheQueryResult(context.cache, query, result.data, variables, ...middleware))
    })
    .catch(ex => {
      console.log('Got error!', ex)
      throw ex
    })
  }

  const context = {
    opts,
    cache: initialCache,
    runQuery,
    events,

    getQueryToExecute(query, variables) {
      return passThroughQuery(context.cache, query, variables, ...middleware)
    },

    cacheFulfillsQuery(query, variables) {
      // include outdated cache
      return passThroughQuery(context.cache, query, variables, ...opts.middleware) === null
    },

    queryCache(query, variables) {
      return queryCache(context.cache, query, variables, ...middleware)
    },

    setCache(cache) {
      context.cache = cache
    },
  }

  return context
}
