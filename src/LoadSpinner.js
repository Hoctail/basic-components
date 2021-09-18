import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { types, getRelativePath, resolvePath } from 'mobx-state-tree'
import {
  plugin,
  metaElement,
  dynamicModelsTypes,
  cssInject,
  typePlugin,
} from '@hoc/plugins-core'

import { DotSpinner } from './DotSpinner'
import { List } from './List'
import { Input } from './Input'

const SLoadSpinner = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  overflow: visible;
`

export const LoadSpinner = plugin('LoadSpinner', {
  loading: false,
  contentPath: types.maybeNull(types.string),
  contentNode: types.maybeNull(
    typePlugin(() => dynamicModelsTypes()),
  ),
  spinner: typePlugin(DotSpinner, p => p.create({
    visible: false,
    outerCss: cssInject(css`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(218, 218, 218, 0.5);
    `),
    innerCss: cssInject(css`
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background-color: transparent;
    `),
  })),
}).views(self => ({
  get content () {
    let res
    if (self.contentPath != null) {
      res = resolvePath(self, self.contentPath)
    } else {
      res = self.contentNode
    }
    return res
  },
})).actions(self => ({
  setContentPath (content) {
    self.contentPath = getRelativePath(self, content)
  },
  setContentNode (content) {
    self.contentNode = content
  },
  setLoading (loading) {
    self.loading = loading
    self.spinner.setVisible(loading)
  },
})).component(class LoadSpinner extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { spinner, content } = data
    return (
      <SLoadSpinner {...restProps} >
        {metaElement(content)}
        {metaElement(spinner)}
      </SLoadSpinner>
    )
  }
}).demo(class Demo extends React.Component {
  constructor (props) {
    super(props)
    this.demo = LoadSpinner.create({
      contentNode: List.create({
        items: [
          Input.create({ text: 'Edit me' }),
        ],
      }),
    })
    const intervalId = window.setInterval(() => {
      try {
        this.demo.setLoading(!this.demo.loading)
      } catch (e) {
        window.clearInterval(intervalId)
        throw e
      }
    }, 3000)
  }

  render () {
    return metaElement(this.demo)
  }
})

export default LoadSpinner
