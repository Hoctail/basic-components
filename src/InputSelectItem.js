import React from 'react'
import styled, { css } from 'styled-components'
import { types, clone } from 'mobx-state-tree'
import {
  plugin,
  metaElement,
  cssInject,
  dynamicModelsTypes,
  typePlugin,
} from '@hoc/plugins-core'

import { SvgIcon } from './SvgIcon'
import { Label } from './Label'
import { List } from './List'
import { TooltipMessage } from './TooltipMessage'

const SelectItemLabelStyle = cssInject('payload', css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ payload }) => payload && payload.get('shrinkWidth') === 'true'
    ? 'calc(100% - 3rem)' : '100%'};
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  color: #fff;
  font: normal 600 0.7rem Montserrat, sans-serif;
  &:hover {
    cursor ${({ payload }) => payload && payload.get('disabled') ? 'default' : 'pointer'};
  }
  ${({ payload }) => payload && payload.get('disabled') ? 'opacity: 0.3;' : ''}
`)

export function createSelectItemColoredText (name, displayName, contentProps = {}, selectItemProps = {}) {
  if (!displayName) displayName = name
  return InputSelectItem.create({
    name: name,
    contentItem: Label.create({
      innerCss: SelectItemLabelStyle,
      text: displayName,
      payload: {
        shrinkWidth: 'true', // be default label menu item is shrunk
      },
      ...contentProps,
    }),
    ...selectItemProps,
  })
}

const SInputSelectItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0 0.2rem 0.4rem;
  outline: none;
  &:hover {
    cursor ${({ disabled }) => disabled ? 'default' : 'pointer'};
    fill-opacity: 0.7;
  }
  &:first-child {
    padding-top: 0.4rem;
  }
  &:last-child {
    padding-bottom: 0.4rem;
  }
  ${({ highlightColor }) => (
    highlightColor
      ? `background: ${highlightColor};`
      : `&:hover {
          background: #F9F9F9;
        }
      `
  )}
`

const SIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 0.5rem;
  height: 100%;
`

export const InputSelectItem = plugin('InputSelectItem', {
  first: false,
  name: '',
  infoTooltip: types.maybeNull(TooltipMessage.Model),
  tooltipText: types.maybeNull(types.string), // additional text displayed in tooltip on hover
  focusable: true,
  highlightColor: types.maybeNull(types.string),
  icon: types.maybeNull(SvgIcon.Model),
  disabled: false,
  contentItem: typePlugin(() => dynamicModelsTypes(), () => Label.create({
    innerCss: SelectItemLabelStyle,
  })),
  defaultEvents: {
    onMouseEnter: 'InputSelectItem.Hover',
    onMouseLeave: 'InputSelectItem.Blured',
  },
}).actions(self => ({
  setDisabled (disabled) {
    self.disabled = disabled
    self.contentItem.setPayload('disabled', self.disabled)
  },
  setCurrent (currentSelectItem) {
    const { name, contentItem, testid } = currentSelectItem
    self.name = name
    self.setTestId(testid)
    self.contentItem = clone(contentItem)
    // propagate disabled state to overwritten self.contentItems
    self.setDisabled(self.disabled)
    self.setFirst()
  },
  setFirst () {
    self.first = true
    self.icon = SvgIcon.create({
      name: 'arrowdown',
      fill: 'rgb(255, 191, 0)',
      width: '8px',
      height: '5px',
      innerCss: cssInject(css`
        fill-opacity: 0.8;
      `),
    })
  },
  afterCreate () {
    self.setDisabled(self.disabled)
    self.createInfoTooltip()
    if (self.first) self.setFirst()
  },
  // copied from MenuItem
  createInfoTooltip () {
    if (self.tooltipText) {
      self.infoTooltip = TooltipMessage.create({
        relativePos: 'right',
      })
    } else self.infoTooltip = null
  },
  // copied from MenuItem
  showInfoTooltip (show = true) {
    if (!self.infoTooltip) return
    if (show) {
      self.infoTooltip.showMessage(
        self, self.tooltipText, { relativePos: 'right', timeout: 30000 },
      )
    } else {
      self.infoTooltip.hide()
    }
  },
  setHighlightColor (highlightColor) {
    self.highlightColor = highlightColor
  },
})).component(props => {
  const { data, ...restProps } = props
  const { nodeId, icon, contentItem, infoTooltip, disabled, highlightColor } = data
  return (
    <SInputSelectItem
      id={nodeId} disabled={disabled}
      highlightColor={highlightColor} {...restProps} >
      {metaElement(contentItem)}
      <SIcon>{icon ? metaElement(icon) : null}</SIcon>
      {metaElement(infoTooltip)}
    </SInputSelectItem>
  )
}).events({
  Blured: ({ self, event }) => {
    self.showInfoTooltip(false)
  },
  Hover: ({ self }) => {
    const { element } = self
    if (element) {
      self.showInfoTooltip(true)
      element.focus({})
    }
  },
}).demo(true, () => List.create({
  innerCss: cssInject(css`
    display: flex;
    flex-direction: column;
    width: fit-content;
    border: 1px solid black;
  `),
  items: [
    createSelectItemColoredText('Public', null, { bgcolor: 'rgb(51, 214, 87)' }),
    createSelectItemColoredText('Private', null, { bgcolor: 'gray' }),
    createSelectItemColoredText('Foo', 'FOO', { bgcolor: 'blue' }),
  ],
}))

export default InputSelectItem
