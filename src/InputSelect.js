import React from 'react'
import styled, { css } from 'styled-components'
import { types, getPath } from 'mobx-state-tree'
import {
  plugin,
  metaElement,
  createModel,
  cssInject,
  typePlugin,
  getRootNode,
} from '@hoc/plugins-core'

import { InputInterfaceModel } from './models/inputInterface'
import { PopupMenu } from './PopupMenu'
import { TooltipMessage } from './TooltipMessage'
import { Tooltip } from './Tooltip'
import { Portal } from './Portal'
import { Relative } from './Relative'
import { TooltipEnvelope } from './TooltipEnvelope'
import { Label } from './Label'
import { List } from './List'
import { InputSelectItem } from './InputSelectItem'

const ShadowFilter = 'drop-shadow(rgba(251, 187, 0, 0.5) 0px 0px 2px)'

export function inputSelectBorderStyle () {
  return css`
    border-radius: 5px;
    color: #637280;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: rgb(251 187 0) 0px 0px 2px;
  `
}

const SInputSelect = styled.div`
  width: ${props => props.width};
`

export const InputSelect = plugin('InputSelect', InputInterfaceModel, {
  currentIdx: 0,
  button: typePlugin(InputSelectItem, p => p.create({
    first: true,
    events: {
      onClick: 'InputSelect.ShowMenu',
      onMouseEnter: 'InputSelect.DoNotFocusOnHover',
    },
  })),
  menu: types.maybeNull(PopupMenu.Model),
  width: '10rem',
  disabled: false,
  disabledMessageText: types.maybeNull(types.string),
}).views(self => ({
  get names () {
    return self.itemsArray.map(({ name }) => name)
  },
  get inputValue () {
    const items = self.itemsArray
    if (self.currentIdx >= 0 && self.currentIdx < items.length) {
      return items[self.currentIdx].name
    }
  },
  get itemsArray () {
    return self.menu.list.items
  },
})).actions(self => ({
  setDisabled (disabled) {
    self.disabled = disabled
    self.button.setDisabled(self.disabled)
  },
  showDisabledMessage (relativeElement, error) {
    const tooltip = getRootNode().getController('TooltipError')
    tooltip.showMessage(relativeElement,
      error,
      { relativePos: 'right' },
    )
  },
  setItems (items) {
    const selectedItems = items.filter(({ first }) => first)
    if (items.length && !selectedItems.length) {
      items[0].setFirst(true)
    }
    self.menu.setMenuItems(items)
    self.setCurrentItem()
  },
  /**
   * Select value or set first item if not defined
  */
  setInputValue (value) {
    const idx = self.names.indexOf(value)
    self.setCurrentIdx(idx !== -1 ? idx : 0)
  },
  afterCreate () {
    self.setDisabled(self.disabled)
    self.setCurrentItem()
  },
  show (relativeItem, offset) {
    if (self.disabled) {
      if (self.disabledMessageText) {
        self.showDisabledMessage(relativeItem.element, self.disabledMessageText)
      }
    } else {
      self.menu.show(relativeItem, offset)
    }
  },
  setCurrentItem () {
    self.setCurrentIdx(self.currentIdx)
  },
  setCurrentIdx (currentIdx) {
    const items = self.itemsArray
    if (currentIdx < 0 || currentIdx >= items.length) return
    self.currentIdx = currentIdx
    self.button.setCurrent(items[self.currentIdx])
  },
  handleItemClick (item) {
    self.setCurrentIdx(
      parseInt(getPath(item).split('/').slice(-1).pop()),
    )
  },
})).constructor((model, props) => {
  const { testid, width, menu, items, ...restProps } = props
  const res = createModel(model, {
    type: 'InputSelect',
    innerCss: cssInject(css`
      width: ${width};
    `),
    width,
    menu: menu || PopupMenu.create({
      testid: `${testid}PopupMenu`,
      relativePos: 'drop-down',
      innerCss: cssInject(inputSelectBorderStyle()),
      items: items ? items.map((item, idx) => {
        if (!idx) item.setFirst()
        return item
      }) : [],
    }),
    testid,
    ...restProps,
  })
  res.menu.tooltip.links.envelope.setShadowFilter(ShadowFilter)
  res.button.setInnerCss(cssInject(css`
    width: ${width};
  `))
  return res
}).component(props => {
  const { data, ...restProps } = props
  const { button, menu } = data
  // wrap button to have consistent css behaviour
  // using first-child, last-child
  return (
    <SInputSelect {...restProps}>
      <div>
        {metaElement(button)}
      </div>
      {metaElement(menu)}
    </SInputSelect>
  )
}).events({
  DoNotFocusOnHover () {
  },
  DemoShowMenuReadonly ({ data }) {
    List.self(data).items[0].showMessage(data.element, 'hello world')
  },
  ShowMenu: ({ self, data }) => {
    self.show(data)
  },
  DemoItemClick: ({ self, data }) => {
    self.handleItemClick(data)
  },
}).demo(true, () => (
  List.create({
    innerCss: cssInject(css`
      display: flex;
      flex-direction: row;
    `),
    items: [
      TooltipMessage.create({
        relativePos: 'right',
        // create custom tooltip for TooltipMessage to use custom styling
        tooltip: Tooltip.create({
          relativePos: 'top',
          arrow: true,
          portal: Portal.create({
            portalid: 'tooltip',
            doNotPropagateEvents: [],
            content: Relative.create({
              content: TooltipEnvelope.create({
                shadowFilter: ShadowFilter,
                innerCss: cssInject(css`
                  width: 10rem;
                `),
                content: null,
              }),
            }),
          }),
          content: Label.create({
            innerCss: cssInject('appColors', css`
              font: normal 600 0.625rem/0.75rem Montserrat,sans-serif;
              color: ${({ appColors }) => appColors.name('errtext')};
              display: flex;
              padding: 0.625rem 1rem;
            `),
          }),
        }),
      }),
      InputSelect.create({
        width: '10rem',
        items: [
          InputSelectItem.create({
            name: 'Private',
            contentItem: Label.create({
              text: 'Private',
              bgcolor: 'lightgray',
            }),
            events: {
              onClick: 'InputSelect.DemoItemClick',
            },
          }),
          InputSelectItem.create({
            name: 'Public',
            contentItem: Label.create({
              text: 'Public',
              bgcolor: 'green',
            }),
            events: {
              onClick: 'InputSelect.DemoItemClick',
            },
          }),
        ],
      }),
      InputSelect.create({
        width: 'fit-content',
        button: InputSelectItem.create({
          first: true,
          name: 'Read-Only',
          contentItem: Label.create({
            text: 'Read-Only',
            bgcolor: 'gray',
          }),
          events: {
            onClick: 'InputSelect.DemoShowMenuReadonly',
          },
        }),
      }),
    ],
  })
))

export default InputSelect
