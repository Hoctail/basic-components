import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { types } from 'mobx-state-tree'
import {
  plugin,
  metaElement,
  cssInject,
  typePlugin,
} from '@hoc/plugins-core'

import { SvgIconE } from './SvgIconE'
import { Label } from './Label'
import { PopupMenu } from './PopupMenu'
import { MenuItem } from './MenuItem'
import { List } from './List'

const SDropdown = styled.div`
  border-radius: 5px;
  background: ${({ appColors }) => appColors.idx(2)};
  box-shadow: 0px 2px 2px ${({ appColors }) => appColors.name('shadow')};
  cursor: pointer;
  outline: none;
`

export const Dropdown = plugin('Dropdown', {
  selectedIdx: 0,
  strings: types.array(types.string),
  messageTexts: types.map(types.string), // key: menu value, value: infoText
  container: typePlugin(List, p => p.create({
    innerCss: cssInject(css`
      display: flex;
      align-items: center;
      padding: 0.5rem;
    `),
    events: {
      onMouseDown: 'Dropdown.ShowList',
    },
    items: [
      Label.create({
        size: 'small',
        innerCss: cssInject(css`
          display: flex;
          width: 100%;
          word-break: break-all;
          &:hover {
            cursor: pointer;
          }
        `),
        text: '',
      }),
      SvgIconE.create({
        name: 'arrowdown',
        innerCss: cssInject(css`
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        `),
      }),
    ],
  })),
  dropdown: typePlugin(PopupMenu, p => p.create({
    innerCss: cssInject(css`
      display: flex;
      flex-direction: column;
      width: 100%;
    `),
    relativePos: 'bottom',
    arrow: false,
    items: [],
  })),
}).reactionsA(self => [
  [
    () => self.selectedIdx,
    () => self.handleSelected(),
    'dropdown select',
  ],
]).views(self => ({
  get selectedString () {
    if (self.selectedIdx >= 0 && self.selectedIdx < self.strings.length) {
      return self.strings[self.selectedIdx]
    }
  },
  get label () {
    return self.container.items[0]
  },
  get btn () {
    return self.container.items[1]
  },
})).actions(self => ({
  afterCreate () {
    self.dropdown.tooltip.links.content.setTestId(`${self.testid}Menu`)
    self.dropdown.tooltip.links.relative.setChildHasMaxWidth(true)
    self.setStrings(self.strings, self.messageTexts)
  },
  handleSelected () {
    if (self.strings.length) {
      if (self.selectedIdx < 0) self.selectedIdx = 0
      const currentItemName = self.strings[self.selectedIdx]
      self.label.setText(currentItemName)
      self.label.setTestId(currentItemName)
      self.notifyObservers()
    }
  },
  selectIdx (selectedIdx) {
    if (selectedIdx >= 0) {
      self.selectedIdx = selectedIdx
    }
  },
  setStrings (strings, messageTexts) {
    // save currently selected
    const current = self.selectedString
    self.strings = strings
    self.messageTexts = messageTexts
    self.dropdown.setMenuItems(self.strings.map(str => {
      return MenuItem.create({
        testid: str,
        text: str,
        tooltipText: self.messageTexts.get(str),
        events: {
          onClick: 'Dropdown.ListItemClicked',
        },
      })
    }))
    // restore the same selection
    if (current) self.select(current)
    self.handleSelected()
  },
  select (name) {
    const idx = self.strings.indexOf(name)
    if (self.selectedIdx !== idx) {
      self.selectIdx(idx)
      self.handleSelected()
    }
  },
})).actions(self => {
  const _observers = []
  function addObserver (cb) {
    const newCb = cb.toString()
    if (_observers.findIndex(oldCb => oldCb === newCb) >= 0) return
    _observers.push(cb)
    self.onDestroy(() => {
      _observers.length = 0
    })
  }
  function notifyObservers () {
    for (let i = 0; i < _observers.length; i++) {
      _observers[i](self.selectedString)
    }
  }
  return { addObserver, notifyObservers }
}).component(class Dropdown extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { appColors, dropdown, container } = data
    return (
      <SDropdown appColors={appColors} {...restProps} >
        {metaElement(dropdown)}
        {metaElement(container)}
      </SDropdown>
    )
  }
}).events({
  ListItemClicked: ({ self, data, event }) => {
    self.select(data.text.text)
    self.dropdown.hide()
  },
  ShowList: ({ self, event }) => {
    // Known issue: show menu on onMouseDown, and use
    // event.preventDefault that prevents changing focus once again,
    // otherwise menu will get onBlur and closed before we see it
    if (!self.dropdown.isVisible) {
      self.dropdown.highlightItemByIdx(self.selectedIdx)
      self.dropdown.show(self)
    } else {
      self.dropdown.hide()
    }
    event.preventDefault()
  },
}).demo(true, () => Dropdown.create({
  strings: ['hello', 'world'],
}))

export default Dropdown
