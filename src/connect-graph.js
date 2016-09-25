import React, {PropTypes} from 'react'
import {passThroughQuery} from 'graphql-cache'
import {print} from 'graphql-tag/printer'

export const connectGraph = options => BaseComponent =>
  class GraphContainer extends React.Component {

    static contextTypes = {
      graphQLContext: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props)

      this.state = {}
      this.cacheUpdated = this.cacheUpdated.bind(this)
    }

    fetch() {
      const query = options.query(this.props)
      const variables = options.variables ? options.variables(this.props) : {}

      this.trackingQuery = {
        query,
        variables,
      }

      console.log('Running', print(query))

      const queryToExecute = passThroughQuery(this.context.graphQLContext.cache, query, variables)

      if (!queryToExecute) {
        this.setState({ _loaded: true }) // eslint-disable-line
        this.reloadDataFromCache()
        return
      }

      this.context.graphQLContext.runQuery(queryToExecute, variables)
      .then(() => {
        this.setState({ _loaded: true }) // eslint-disable-line
      })
    }

    cacheUpdated() {
      this.reloadDataFromCache()
    }

    reloadDataFromCache() {
      if (!this.trackingQuery) return null

      const myData = this.context.graphQLContext.queryCache(this.trackingQuery.query, this.trackingQuery.variables)

      this.setState({ data: myData }) // eslint-disable-line
    }

    componentWillMount() {
      if (!this.context.graphQLContext) {
        throw new Error('connectGraph is being used without GraphQLProvider')
      }

      if (!options.query) {
        throw new Error('No query passed to connectGraph')
      }

      this.context.graphQLContext.events.on('cacheUpdated', this.cacheUpdated)

      this.fetch()
    }

    componentWillUnmount() {
      this.context.graphQLContext.events.removeListener('cacheUpdated', this.cacheUpdated)
    }

    render() {
      if (this.state._loaded && this.state.data) {
        return (
          <BaseComponent {...this.props} {...this.state.data} />
        )
      }

      return React.createElement(this.context.graphQLContext.opts.defaultLoadingComponent)
    }

  }
