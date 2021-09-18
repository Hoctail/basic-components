import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import { metaElement, plugin } from '@hoc/plugins-core'

import { List } from './List'

const selectedStyle = css`
  height: calc(2.5rem + 4px);
  box-shadow: 0 0 5px rgba(99, 114, 128, 0.5);
  padding-left: 2rem;
  padding-right: 1.35rem;
`

const normalStyle = css`
  height: calc(2rem + 4px);
  box-shadow: 0 0 5px rgba(99, 114, 128, 0.2);
  &:hover {
    cursor: pointer;
    opacity: 0.9;
  }
`

// basic styling here to avoid replacing an entire style by innerCss
const STab = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #ffffff;
  border-radius: 10px 10px 0 0;
  color: #637280;
  margin-left: 2px;
  margin-right: 2px;
  position: relative;
  ${props => props.selected ? selectedStyle : normalStyle};
`

export const Tab = plugin('Tab', {
  id: types.identifier,
  container: List.Model,
  selected: false,
}).actions(self => ({
  setSelected (selected) {
    self.selected = selected
    if (self.content && self.content.setSelected) {
      self.content.setSelected(selected)
    }
  },
})).views(self => ({
  get content () {
    if (self.container.items.length) {
      return self.container.items[0]
    }
  },
})).component(class TabClass extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { selected, container, testid } = data
    const testId = (selected ? 'Active' : '') + testid
    return (
      <STab selected={selected} {...restProps} data-testid={testId} >
        {metaElement(container)}
      </STab>
    )
  }
})

export default Tab
