import styled, { css } from 'styled-components'
import React, { Component } from 'react'
import { types, getSnapshot } from 'mobx-state-tree'
import { keys } from 'mobx'
import PropTypes from 'prop-types'
import {
  plugin,
  metaElement,
  createModel,
  cssInject,
  getRootNode,
} from '@hoc/plugins-core'

import { Button } from './Button'
import { SvgIcon } from './SvgIcon'
import { SvgIconE } from './SvgIconE'
import { List } from './List'

import { bordered } from './hocs/bordered'
import { withButtonActivities } from './hocs/buttonActivities'

const SizeType = types.optional(types.enumeration('SizeType',
  ['small', 'medium', 'large', 'extralarge', 'custom']), 'custom',
)

/**
 * This model is intended to be composed with SvgButtonModel
 * as it has dependencies on it in views(...) section
*/
const ButtonConfigModel = types.model('ButtonConfigModel', {
  name: types.maybeNull(types.string),
  size: SizeType,
  iconWidth: types.maybeNull(types.string),
  iconHeight: types.maybeNull(types.string),
  iconColor: types.maybeNull(types.string),
  width: types.maybeNull(types.string),
  height: types.maybeNull(types.string),
  borderRadiusRoundSquare: types.maybeNull(types.string),
  borderRadiusCircle: types.maybeNull(types.string),
  background: types.maybeNull(types.string),
  opacityActive: 1,
  boxShadowActive: '0 0 0 1px rgba(37, 38, 94, 0.1)',
  opacityHover: 0.8,
  boxShadowHover: types.maybeNull(types.string),
  opacityClicked: 0.5,
  boxShadowClicked: 'inset 0px 0px 5px rgba(99, 114, 128, 0.2)',
}).views(self => ({
  // model should be composed with a model having a 'shape' field
  get borderRadius () {
    switch (self.shape) {
      case 'circle': return '50%'
      case 'roundSquare': return self.borderRadiusRoundSquare
      default: return null
    }
  },
  boxShadow (pointerIsDown) {
    if (!self.shape || !self.shape.length) return null
    if (pointerIsDown) return self.boxShadowClicked
    else return self.boxShadowActive
  },
  opacityOnHover (pointerIsDown) {
    if (pointerIsDown) return self.opacityClicked
    else return self.opacityHover
  },
})).actions(self => ({
  afterCreate () {
    let width, height, radius
    switch (self.size) {
      case 'small':
        width = '12px'
        height = '12px'
        radius = '3px'
        break
      case 'medium':
        break
      case 'large':
        width = '32px'
        height = '32px'
        radius = '10px'
        break
      case 'extralarge':
        width = '48px'
        height = '48px'
        radius = '15px'
        break
    }
    if (self.width == null && width !== undefined) self.width = width
    if (self.height == null && height !== undefined) self.height = height
    if (self.borderRadiusRoundSquare == null && radius !== undefined) {
      self.borderRadiusRoundSquare = radius
    }
  },
}))

const ButtonConfigModels = types.model('ButtonConfigModels', {
  configs: types.map(ButtonConfigModel),
}).views(self => ({
  get (name) {
    const res = self.configs.get(name)
    if (!res && name) {
      if (process.NODE_ENV === 'development') {
        console.warn(`Unknown SvgButton name: ${name}`)
      }
    }
    return res
  },
})).actions(self => ({
  addButtonConfig (name, config) {
    self.configs.set(name, createModel(ButtonConfigModel, config))
  }
}))

const buttonsConfig = createModel(ButtonConfigModels, {
  configs: {
    dots: createModel(ButtonConfigModel, {
      name: 'dots',
      size: 'large',
      iconWidth: '0.25rem',
      iconHeight: '1rem',
      background: '#FFFFFF',
    }),
    smallcross: createModel(ButtonConfigModel, {
      name: 'smallcross',
      width: '16px',
      height: '16px',
      iconWidth: '8px',
      iconHeight: '8px',
      borderRadiusRoundSquare: '5px',
      background: '#959595',
    }),
  },
})

/**
 * @public
 * @param {string} name
 * @param {object} config
 * {
 *   name: types.maybeNull(types.string),
 *   size: ('small', 'medium', 'large', 'extralarge', 'custom'),
 *   iconWidth: types.maybeNull(types.string),
 *   iconHeight: types.maybeNull(types.string),
 *   iconColor: types.maybeNull(types.string),
 *   width: types.maybeNull(types.string),
 *   height: types.maybeNull(types.string),
 *   borderRadiusRoundSquare: types.maybeNull(types.string),
 *   borderRadiusCircle: types.maybeNull(types.string),
 *   background: types.maybeNull(types.string),
 *   opacityActive: 1,
 *   boxShadowActive: '0 0 0 1px rgba(37, 38, 94, 0.1)',
 *   opacityHover: 0.8,
 *   boxShadowHover: types.maybeNull(types.string),
 *   opacityClicked: 0.5,
 *   boxShadowClicked: 'inset 0px 0px 5px rgba(99, 114, 128, 0.2)',
 * }
*/
export function addSvgButtonConfig (name, config) {
  buttonsConfig.addButtonConfig(name, config) 
}

// Note: Component is wrapped by hocs
const OuterRect = withButtonActivities(
  bordered(
    styled.div`
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.1rem;
      min-height: ${props => props.data.height};
      min-width: ${props => props.data.width};
    `,
  ),
)

export const SvgButton = plugin('SvgButton', Button.Model, ButtonConfigModel, {
  icon: types.union(SvgIconE.Model, SvgIcon.Model),
  shape: types.optional(types.enumeration('Shape',
    ['', 'circle', 'square', 'roundSquare']), '',
  ),
  size: SizeType,
}).constructor((model, props) => {
  const { name, shape, size, iconWidth, iconHeight, iconColor, ...restProps } = props
  let config
  if (buttonsConfig.get(name)) {
    config = getSnapshot(buttonsConfig.get(name))
  }
  return createModel(model, {
    type: 'SvgButton',
    icon: config ? SvgIconE.create({
      name: config.name,
      width: iconWidth || config.iconWidth,
      height: iconHeight || config.iconHeight,
      fill: iconColor || config.iconColor,
    }) : null,
    shape,
    size,
    ...config,
    name, // keep the name provided
    ...restProps,
  })
}).component(class CSvgButton extends Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    // pass disabled flag as a props as data.disable changes
    // will not be observed after creation created (mst known issue)
    const { disabled, icon } = data
    return (
      <OuterRect data={data} disabled={disabled} {...restProps} >
        {metaElement(icon)}
      </OuterRect>
    )
  }
}).events({
  DemoClick: ({ data }) => alert(`SvgButton ${data.name}/${data.size}/${data.shape} Clicked`),
  DemoMouseEnter: ({ data }) => {
    const message = getRootNode().getController('TooltipMessage')
    message.showMessage(data, `${data.name}/${data.size}/${data.shape}`, { timeout: 3000 })
  },
  DemoMouseLeave: ({ data }) => {
    const message = getRootNode().getController('TooltipMessage')
    message.hide()
  },
}).demo(true, () => List.create({
  items: ['', 'circle', 'square', 'roundSquare'].map(shape => List.create({
    innerCss: cssInject(css`
      display: flex;
    `),
    items: keys(buttonsConfig.configs).map(name => SvgButton.create({
      name,
      shape,
      events: {
        onClick: 'SvgButton.DemoClick',
        onMouseEnter: 'SvgButton.DemoMouseEnter',
        onMouseLeave: 'SvgButton.DemoMouseLeave',
      },
    })),
  })),
}))

export default SvgButton
