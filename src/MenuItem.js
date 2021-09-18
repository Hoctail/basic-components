import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import {
  metaElement,
  CssModel,
  cssInject,
  createModel,
  plugin,
  typePlugin,
} from '@hoc/plugins-core'

import { SvgIcon } from './SvgIcon'
import { Label } from './Label'
import { TooltipMessage } from './TooltipMessage'

const SMenuItem = styled.div`
  display: flex;
  align-items: center;
  height: 2rem;
  padding-right: 0.5rem;
  -webkit-user-select: none;
`

export const MenuItem = plugin('MenuItem', {
  inactive: false,
  focused: false,
  focusable: true,
  infoTooltip: types.maybeNull(TooltipMessage.Model),
  tooltipText: types.maybeNull(types.string),
  innerCss: types.optional(CssModel, cssInject('inactive', css`
    outline: none;
    opacity: ${props => props.inactive ? '0.5' : '1'};
    border-radius: inherit;
    &:hover {
      cursor: pointer;
      background: #F9F9F9;
      fill-opacity: 0.7;
      border-radius: inherit;
    }
    &:focus {
      background: #F9F9F9;
      fill-opacity: 0.7;
      border-radius: inherit;
    }
  `)),
  icon: typePlugin(SvgIcon, p => p.create({
    innerCss: cssInject(css`
      height: 1rem;
      width: 1rem;
      fill: #637280;
      fill-opacity: 0.9;
      padding-left: 0.5rem;
    `),
  })),
  text: typePlugin(Label, p => p.create({
    innerCss: cssInject(css`
      padding-left: 0.5rem;
      font: normal 500 0.625rem/0.75rem Montserrat, sans-serif;
      color: #637280;
      word-break: break-all;
      &:hover {
        cursor: pointer;
      }
    `),
  })),
  defaultEvents: {
    onMouseEnter: 'MenuItem.Hover',
    onMouseLeave: 'MenuItem.Blured',
  },
}).views(self => ({
  get name () {
    return self.text.text
  },
})).actions(self => ({
  setFocused (focused) {
    self.focused = focused
    self.showInfoTooltip(focused)
  },
  createInfoTooltip () {
    if (self.tooltipText) {
      self.infoTooltip = TooltipMessage.create({
        relativePos: 'right',
      })
    } else self.infoTooltip = null
  },
  showInfoTooltip (show = true) {
    if (!self.infoTooltip) return
    if (show) {
      self.infoTooltip.showMessage(
        self, self.tooltipText, { relativePos: 'right' },
      )
    } else {
      self.infoTooltip.hide()
    }
  },
  afterCreate () {
    self.createInfoTooltip()
    if (self.inactive && !self.events.has('onClick')) {
      self.setEvents({
        onClick: 'MenuItem.InactiveClicked',
      })
    }
  },
})).component(class MenuItemClass extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { nodeId, icon, text, infoTooltip } = data
    return (
      <SMenuItem id={nodeId} {...restProps}
      >
        {icon ? metaElement(icon) : null}
        {metaElement(text)}
        {metaElement(infoTooltip)}
      </SMenuItem>
    )
  }
}).constructor((model, props) => {
  const { icon, text, ...restProps } = props
  const res = createModel(model, {
    type: 'MenuItem',
    ...restProps,
  })
  res.text.setText(text)
  res.icon.setName(icon)
  return res
}).events({
  InactiveClicked: ({ event }) => {
    event.stopPropagation()
  },
  Blured: ({ self }) => {
    self.setFocused(false)
  },
  Hover: ({ self }) => {
    const { element } = self
    if (element) {
      self.setFocused(true)
      element.focus({})
    }
  },
})

export default MenuItem
