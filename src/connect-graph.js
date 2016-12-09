/* eslint-disable react/no-set-state */

import React, {PropTypes} from 'react'

export const connectGraph = options => BaseComponent =>
  class GraphContainer extends React.Component {

    static contextTypes = {
      graphQLContext: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props)

      this.state = {
        isFetching: false,
        data: undefined,
      }

      this.hasCompletedInitialLoad = false

      this.cacheUpdated = this.cacheUpdated.bind(this)
    }

    fetch(query, variables) {
      this.setState({ isFetching: true })

      return this.context.graphQLContext.runQuery(query, variables)
      .then(() => {
        this.hasCompletedInitialLoad = true
        this.setState({ isFetching: false, hasError: false, error: null })
      })
      .catch(error => {
        this.hasCompletedInitialLoad = true
        this.setState({ isFetching: false, hasError: true, error })
      })
    }

    updateTrackingQuery(query, variables) {
      this.trackingQuery = {
        query,
        variables,
      }
    }

    initialLoadWithProps(props) {
      const query = options.query()
      const variables = options.variables ? options.variables(props) : {}

      // can render without fetching?
      if (options.renderOutdated) {
        if (this.context.graphQLContext.cacheFulfillsQuery(query, variables)) {
          console.log('Rendering outdated version from cache whilst loading')
          this.hasCompletedInitialLoad = true
          this.updateTrackingQuery(query, variables)
          this.loadFromCache()
        }
      }

      // determine what needs fetching
      const queryToExecute = options.refetchOnMount
        ? query
        : this.context.graphQLContext.getQueryToExecute(query, variables)

      // if everything is cache, just render from cache.
      // don't render if we rendered with outdated cache because it will be the same data
      if (!queryToExecute && !options.renderOutdated) {
        this.hasCompletedInitialLoad = true
        this.updateTrackingQuery(query, variables)
        this.loadFromCache()
        return
      }

      if (!queryToExecute) {
        return
      }

      return this.fetch(queryToExecute, variables)
      .then(() => {
        if (!this.state.hasError) {
          this.updateTrackingQuery(query, variables)
          this.loadFromCache()
        }
      })
    }

    loadFromCache() {
      if (!this.trackingQuery) return null

      const myData = this.context.graphQLContext.queryCache(this.trackingQuery.query, this.trackingQuery.variables)

      this.setState({ data: myData })
    }

    cacheUpdated() {
      this.loadFromCache()
    }

    componentWillMount() {
      if (!this.context.graphQLContext) {
        throw new Error('connectGraph is being used without GraphQLProvider')
      }

      if (!options.query) {
        throw new Error('No query passed to connectGraph')
      }

      if (!options.ignoreUpdates) {
        this.context.graphQLContext.events.on('cacheUpdated', this.cacheUpdated)
      }

      this.initialLoadWithProps(this.props)
    }

    forceRefetch() {
      if (!this.trackingQuery) {
        return this.initialLoadWithProps(this.props)
      }

      return this.fetch(this.trackingQuery.query, this.trackingQuery.variables)
      .then(() => this.loadFromCache())
    }

    componentWillReceiveProps(nextProps) {
      this.initialLoadWithProps(nextProps)
    }

    componentWillUnmount() {
      this.context.graphQLContext.events.removeListener('cacheUpdated', this.cacheUpdated)
    }

    render() {
      const graph = {
        isFetching: this.state.isFetching,
        hasError: this.state.hasError,
        error: this.state.error,
        forceRefetch: this.forceRefetch.bind(this),
      }

      if (this.state.data !== undefined && this.hasCompletedInitialLoad) {
        return (
          <BaseComponent
            {...this.props}
            {...this.state.data}
            graph={graph}
          />
        )
      }

      if (this.state.hasError && !graph.isFetching) {
        return this.context.graphQLContext.opts.defaultRenderError(this.state.error, graph)
      }

      return this.context.graphQLContext.opts.defaultRenderLoading(graph)
    }

  }
