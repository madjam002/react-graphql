import React from 'react'
import toClass from 'recompose/toClass'

export const withFragments = options => BaseComponent => {
  const BaseComponentClass = toClass(BaseComponent) // eslint-disable-line

  return class WithFragments extends React.Component {

    static getFragment(name) {
      return options.fragments[name]()
    }

    render() {
      return (
        <BaseComponentClass ref="component" {...this.props} />
      )
    }

  }
}
