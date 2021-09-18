import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'styled-components'
import { types, getParentOfType, isAlive } from 'mobx-state-tree'
import {
  metaElement,
  cssInject,
  createModel,
  plugin,
} from '@hoc/plugins-core'

import { Tooltip } from './Tooltip'
import { MenuItem } from './MenuItem'
import { List } from './List'
import { Button } from './Button'

export const PopupMenu = plugin('PopupMenu', {
  tooltip: Tooltip.Model,
  bound: types.maybeNull(types.string),
}).views(self => ({
  get menuItems () {
    return self.list.items
  },
  get list () {
    return self.tooltip.links.content
  },
  get hasHighlighedMenuItem () {
    return self.menuItems.filter(({ autoFocus }) => autoFocus).length !== 0
  },
  get isVisible () {
    return self.tooltip.visible
  },
})).actions(self => {
  let _boundData
  function boundToData (data) {
    _boundData = data
    self.onDestroy(() => {
      _boundData = null
    })
  }
  function getBoundData () {
    return _boundData
  }

  return { boundToData, getBoundData }
}).actions(self => ({
  boundToNode (nodeId) {
    self.bound = nodeId
  },
  setDoNotPropagateEvents (flag) {
    if (flag) self.tooltip.portal.setDoNotPropagateEvents()
    else self.tooltip.portal.setDoNotPropagateEvents([])
  },
  setTestId (testid) {
    self.tooltip.setTestId(testid)
  },
  setTestKey (testkey) {
    self.tooltip.setTestKey(testkey)
  },
  highlightItemByIdx (idx) {
    const items = self.menuItems
    if (idx < 0 || idx > items.lenght) return
    // Known issue:
    // make sure only one menu item will have autofocus enabled
    // otherwise PopupMenu may hide at the wrong moment
    // as event.relatedTarget can be null even if focus
    // is switching from first to second menu item
    items.forEach((menuItem, menuItemIdx) => {
      menuItem.setAutoFocus(idx === menuItemIdx)
    })
  },
  setMenuItems (menuItems) {
    self.list.setItems(menuItems)
    // by default focus is on first menu item
    if (!self.hasHighlighedMenuItem) self.highlightItemByIdx(0)
  },
  show (relativeItem, offset) {
    self.tooltip.showTooltip(relativeItem, offset)
  },
  hide () {
    self.tooltip.hide()
  },
})).component(class PopupMenuClass extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data } = this.props
    const { tooltip } = data
    return metaElement(tooltip)
  }
}).constructor((model, props) => {
  const { testid, testkey, arrow, items, innerCss, relativePos, ...restProps } = props
  const res = createModel(model, {
    type: 'PopupMenu',
    // TODO: remove if has no effect
    innerCss: cssInject(css`
      width: 10rem;
    `),
    tooltip: Tooltip.create({
      relativePos: relativePos || 'top-left',
      arrow: arrow,
      content: List.create({
        testid: testid,
        testkey: testkey,
        innerCss: innerCss || undefined,
        events: {
          onBlur: 'PopupMenu.Blur',
          /* intercept click event here to hide menu after MenuItem
          is clicked. Works if user defined onClick on menuitem too */
          onClick: 'PopupMenu.Click',
        },
      }),
    }),
    ...restProps,
  })
  res.setMenuItems(items)
  return res
}).demo(true, () => List.create({
  items: [
    Button.create({
      name: 'Demo Menu',
      events: {
        onClick: 'PopupMenu.DemoShow',
      },
    }),
    PopupMenu.create({
      relativePos: 'top-left',
      items: [
        MenuItem.create({
          icon: 'pencil',
          text: 'Fake Edit',
          events: {
            onClick: 'PopupMenu.DemoFakeEdit',
          },
        }),
        MenuItem.create({
          text: 'hello',
          events: {
            onClick: 'PopupMenu.DemoHello',
          },
        }),
      ],
    }),
  ],
  mapping: {
    button: 0,
    menu: 1,
  },
})).events({
  Blur: ({ data, event }) => {
    let closeMenu = true
    const popupMenu = PopupMenu.self(data)
    if (event.relatedTarget) {
      const menuItemsElement = popupMenu.list.element
      const focusedElem = event.relatedTarget
      // close if focus moved outside of menu
      closeMenu = !menuItemsElement.contains(focusedElem)
    }
    if (closeMenu) popupMenu.hide()
  },
  Click: ({ data, event }) => {
    if (isAlive(data) && !data.disabled) PopupMenu.self(data).hide()
    else event.stopPropagation()
  },
  DemoShow: ({ event, data }) => {
    const parentList = getParentOfType(data, List.Model)
    const menu = parentList.itemByMapping('menu')
    menu.show(data)
  },
  DemoFakeEdit: () => {
    console.log('Fake Edit clicked')
  },
  DemoHello: () => {
    console.log('Hello clicked')
  },
})

export default PopupMenu
