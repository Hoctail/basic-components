import React from 'react'
import styled, { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import {
  metaElement,
  getStyle,
  CssModel,
  cssInject,
  plugin,
} from '@hoc/plugins-core'

import { List } from './List'

function injectEvents (items) {
  if (items) {
    items.forEach((item) => {
      item.setEvents({
        onClick: 'ListSelectable.ItemClicked',
      })
    })
  }
}

const SListBox = styled.div`
`

export const ListSelectable = plugin('ListSelectable', List.Model, {
  selectedIdx: -1,
  // put appColors prop in render
  selectedCss: types.optional(CssModel, cssInject(css`
    border-radius: 5px;
    background-color: ${({ selected, appColors }) => selected ? appColors.idx(4) : ''};
  `)),
}).actions(self => ({
  afterCreate () {
    self.setItems(self.items)
  },
  select (idx) {
    self.selectedIdx = idx
  },
  scrollIntoSelectedItem () {
    if (self.selected && self.selected.element) {
      const target = self.selected.element
      target.parentNode.scrollTop = target.offsetTop
      target.parentNode.scrollLeft = target.offsetLeft
      target.focus({})
    }
  },
  setItems (items) {
    injectEvents(items)
    self.items = items
  },
})).actions(self => {
  let _observer
  function setObserver (cb) {
    _observer = cb
    self.onDestroy(() => {
      _observer = null
    })
  }
  function getObserver () {
    return _observer
  }
  return { setObserver, getObserver }
}).views(self => ({
  get selected () {
    if (self.selectedIdx >= 0 && self.selectedIdx < self.items.length) {
      return self.items[self.selectedIdx]
    }
  },
  get indexes () {
    const indexes = {}
    self.items.forEach((item, idx) => {
      indexes[item.nodeId] = idx
    })
    return indexes
  },
})).reactionsA(self => [
  [
    () => self.selectedIdx,
    idx => {
      self.scrollIntoSelectedItem()
      const observer = self.getObserver()
      if (observer) observer(idx)
    },
  ],
]).component(class ListSelectable extends React.Component {
  static propTypes = { data: PropTypes.object }
  constructor (props) {
    super(props)
    const { data } = props
    const { selectedCss } = data
    this.Selected = getStyle(data, selectedCss)
  }

  render () {
    const { data, ...restProps } = this.props
    const { items, emptyMessage, selectedIdx, appColors } = data
    const components = items.map((item, idx) => {
      const selected = selectedIdx === idx
      return (
        <this.Selected appColors={appColors} selected={selected} key={idx} >
          {metaElement(item, { key: idx, selected /* for future */ })}
        </this.Selected>
      )
    })
    return (
      <SListBox {...restProps} >
        {components.length ? components : metaElement(emptyMessage)}
      </SListBox>
    )
  }
}).events({
  ItemClicked: ({ data }) => {
    const self = ListSelectable.self(data)
    self.select(self.indexes[data.nodeId])
  },
})

export default ListSelectable
