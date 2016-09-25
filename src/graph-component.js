import React from 'react'

export const graphComponent = options => BaseComponent =>
  class GraphComponent extends React.Component {

    static getFragment(name) {
      return options.fragments[name]()
    }

    render() {
      return (
        <BaseComponent ref="component" {...this.props} />
      )
    }

  }
