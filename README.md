react-graphql [![Build Status](https://img.shields.io/travis/madjam002/react-graphql/master.svg?style=flat)](https://travis-ci.org/madjam002/react-graphql)  [![NPM](https://img.shields.io/npm/v/react-graphql.svg)](https://npmjs.com/package/react-graphql) [![Github Issues](https://img.shields.io/github/license/madjam002/react-graphql.svg)](https://github.com/madjam002/react-graphql)
==================

> A simple but powerful GraphQL client for React

**This project is a work in progress and is not ready for production yet. The API is likely to change over the next couple of weeks.**

*Docs coming soon*

## Example

```js
import React from 'react'
import ReactDOM from 'react-dom'
import {gql, connectGraph, graphComponent} from 'react-graphql'
import {print} from 'graphql-tag/printer'

const MyApp = connectGraph({
  query: () => gql`
    query($userId: ID!) {
      user(id: $userId) {
        id
        name
        ${AboutUser.getFragment('user')}
      }
    }
  `,
  variables: props => ({
    userId: props.userId,
  }),
})(props => (
  <div>
    <h1>Welcome, {props.user.name}!</h1>
    <hr />
    <AboutUser user={props.user} />
  </div>
))

const AboutUser = graphComponent({
  fragments: {
    user: () => gql`
      fragment AboutUser on User {
        about
      }
    `,
  },
})(props => (
  <p>
    {props.user.about}
  </p>
))

const graphQLContext = createGraphQLContext({
  defaultLoadingComponent: Loading,
  async executeQuery(query, variables) {
    const res = await fetch(/* your graphql server */, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(query),
        variables,
      }),
    })

    const result = await res.json()

    return result
  },
})

ReactDOM.render(
  <GraphQLProvider context={graphQLContext}>
    <MyApp />
  </GraphQLProvider>
, document.getElementById('app'))
```

## License

Licensed under the MIT License.

[View the full license here](https://raw.githubusercontent.com/madjam002/react-graphql/master/LICENSE).
