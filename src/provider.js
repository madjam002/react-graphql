import React, {PropTypes} from 'react'

export class GraphQLProvider extends React.Component {

  static childContextTypes = {
    graphQLContext: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.graphQLContext = props.context
  }

  getChildContext() {
    return {
      graphQLContext: this.graphQLContext,
    }
  }

  render() {
    return 5
  }

}
