import React from 'react'
import { css } from 'styled-components'
import PropTypes from 'prop-types'
import { isStateTreeNode, types, getRelativePath, resolvePath } from 'mobx-state-tree'
import {
  plugin,
  metaElement,
  cssInject,
  typePlugin,
} from '@hoc/plugins-core'

import { DotSpinner } from './DotSpinner'
import { List } from './List'
import { Label } from './Label'
import { Portal } from './Portal'
import { Relative } from './Relative'

function newSpinner () {
  return DotSpinner.create({
    outerCss: cssInject(css`
      position: absolute;
      left: 0;
      bottom: 0;
      top: 0;
      right: 0;
      background: rgba(218, 218, 218, 0.5);
    `),
    innerCss: cssInject(css`
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background-color: transparent;
    `),
  })
}

/**
 * Should be used with components displaying artefacts in portal
 * and need to place spinner above them.
*/
export const LoadPortalSpinner = plugin('LoadPortalSpinner', {
  loading: false,
  // increment updParent to say render parent is updated. We need this trick
  // as render doesn't depend on parent directly as it is just node / element.
  updParent: 0,
  contentPathType: types.maybeNull(
    types.enumeration(['selector', 'relativeNode']),
  ),
  contentPath: types.maybeNull(types.string),
  spinner: typePlugin(Portal, p => p.create({
    visible: false,
    doNotPropagateEvents: [],
    content: Relative.create({
      content: newSpinner(),
    }),
  })),
  defaultEvents: {
    onComponentDidMount: 'LoadPortalSpinner.SetupDidMount',
  },
}).views(self => ({
  get parent () {
    let parent
    if (self.contentPathType === 'selector') {
      parent = document.querySelector(self.contentPath)
      // by default show over an entire app
      if (!parent) parent = document.querySelector('[data-testid="App"]')
    } else if (self.contentPath != null) {
      parent = resolvePath(self, self.contentPath).element
    }
    return parent
  },
})).actions(self => ({
  setContentManually (type, path) {
    self.contentPathType = type
    self.contentPath = path
    self.setupPortalSpinner()
  },
  setContent (content) {
    try {
      if (content) {
        if (isStateTreeNode(content)) {
          self.contentPath = getRelativePath(self, content)
          self.contentPathType = 'relativeNode'
        } else {
          self.contentPath = content
          self.contentPathType = 'selector'
        }
      }
    } catch (e) {
      // log error and do nothing
      console.error(e)
      return
    }
    self.setupPortalSpinner()
  },
  setupPortalSpinner () {
    self.updParent = self.updParent + 1
    const parent = self.parent
    if (parent) self.spinner.content.setParent(parent)
  },
  /**
   * @parent - plugin node residing in the same tree,
   * or HTML selector string to be queried by document.querySelector.
  */
  setLoading (loading, parent = null) {
    self.loading = loading
    self.spinner.setVisible(loading)
    if (parent) {
      self.setContent(parent)
    }
  },
})).component(class LoadPortalSpinner extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { spinner, updParent } = data
    // use updParent to trigger render when parent is updated
    if (updParent) {}
    return (
      <div {...restProps} >
        {metaElement(spinner)}
      </div>
    )
  }
}).events({
  SetupDidMount: ({ self }) => {
    self.setupPortalSpinner()
  },
}).demo(class Demo extends React.Component {
  constructor (props) {
    super(props)
    this.demo = List.create({
      events: {
        onComponentDidMount: 'LoadPortalSpinner.DemoDidMount',
      },
      items: [
        LoadPortalSpinner.create(),
        // put label into a list, as label itself won't accept custom size
        List.create({
          innerCss: cssInject(css`
            display: block;
            width: 10rem;
            height: 5rem;
            border: 1px solid black;
          `),
          items: [
            Label.create({
              text: 'Some text',
            }),
          ],
        }),

      ],
    })
    const intervalId = window.setInterval(() => {
      try {
        // set content in runtime as client rect changed since did mount
        this.demo.items[0].setContent(this.demo.items[1])
        this.demo.items[0].setLoading(!this.demo.items[0].loading)
      } catch (e) {
        window.clearInterval(intervalId)
        throw e
      }
    }, 3000)
  }

  render () {
    // eslint-disable-next-line react/prop-types
    return metaElement(this.demo, { demo: this.props.demo })
  }
}).events({
  DemoDidMount: ({ data }) => {
    const self = data
    self.items[0].setContent(self.items[1])
    self.items[0].spinner.content.startObservingScrollElement(
      document.querySelector('[data-testid="App"]'),
    )
  },
})

export default LoadPortalSpinner
