import React from 'react'
import styled, { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import {
  metaElement,
  dynamicModelsTypes,
  lateType,
  cssInject,
  plugin,
} from '@hoc/plugins-core'

import { List } from './List'
import { Label } from './Label'

import { Positions, RelativePos } from './models/rect'

const TooltipArrowSize = '0.5rem'
const arrowBR = css`
  top: 1px;
  left: 1px;
  border-bottom-color: inherit;
  margin-top: calc(${TooltipArrowSize} * -2);
  margin-left: ${TooltipArrowSize};
`

const arrowBC = css`
  top: 1px;
  left: 50%;
  border-bottom-color: inherit;
  margin-top: calc(${TooltipArrowSize} * -2);
  margin-left: -${TooltipArrowSize};
`

const arrowBL = css`
  top: 1px;
  right: 1px;
  border-bottom-color: inherit;
  margin-top: calc(${TooltipArrowSize} * -2);
  margin-right: ${TooltipArrowSize};
`

const arrowTR = css`
  bottom: 1px;
  left: 1px;
  border-top-color: inherit;
  margin-bottom: calc(${TooltipArrowSize} * -2);
  margin-left: ${TooltipArrowSize};
`

const arrowTC = css`
  bottom: 1px;
  left: 50%;
  border-top-color: inherit;
  margin-bottom: calc(${TooltipArrowSize} * -2);
  margin-left: -${TooltipArrowSize};
`

const arrowTL = css`
  bottom: 1px;
  right: 1px;
  border-top-color: inherit;
  margin-bottom: calc(${TooltipArrowSize} * -2);
  margin-right: ${TooltipArrowSize};
`

const arrowR = css`
  top: 50%;
  left: 1px;
  border-right-color: inherit;
  margin-left: calc(${TooltipArrowSize} * -2);
  margin-top: -${TooltipArrowSize};
`

const arrowL = css`
  top: 50%;
  right: 1px;
  border-left-color: inherit;
  margin-right: calc(${TooltipArrowSize} * -2);
  margin-top: -${TooltipArrowSize};
`

const arrow = css`
  &:after {
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border: ${TooltipArrowSize} solid transparent;
    ${props => {
      switch (props.pos) {
        case 'bottom-left':
          return arrowBL
        case 'bottom':
          return arrowBC
        case 'bottom-right':
          return arrowBR
        case 'top-left':
          return arrowTL
        case 'top':
          return arrowTC
        case 'top-right':
          return arrowTR
        case 'right':
          return arrowR
        case 'left':
          return arrowL
        case 'drop-down':
          return ''
        default:
          return arrowBL
      }
    }};
  }
`

const defaultFilter = 'drop-shadow(0 0 2px rgba(99, 114, 128, 0.5))'
const TooltipContent = styled.div`
  filter: ${props => props.filter || defaultFilter};
  -webkit-filter: ${props => props.filter || defaultFilter};
  border-radius: 5px;
  background: inherit;
  border-color: inherit;
  z-index: 1;
  ${props => props.arrow ? arrow : ''};
`

const STooltipEnvelope = styled.div`
  background: #fff;
  border-color: #fff;
  border-radius: 5px;
  margin: ${({ arrow, pos }) => {
    if (!arrow) return ''
    switch (pos) {
      case 'bottom':
      case 'bottom-left':
      case 'bottom-right':
        return '10px 0 0 0'
      case 'top':
      case 'top-left':
      case 'top-right':
        return '0 0 10px 0'
      case 'right':
        return '0 0 0 10px'
      case 'left':
        return '0 10px 0 0'
      default:
        return ''
    }
  }}
`

export const TooltipEnvelope = plugin('TooltipEnvelope', {
  relativePos: types.optional(RelativePos, 'bottom'),
  arrow: false,
  content: lateType(() => types.maybeNull(dynamicModelsTypes())),
  shadowFilter: 'drop-shadow(0 0 2px rgba(99, 114, 128, 0.5))',
}).actions(self => ({
  setArrow (arrow) {
    self.arrow = arrow
  },
  setShadowFilter (filter) {
    self.shadowFilter = filter
  },
  setContent (content) {
    self.content = content
  },
  setRelativePos (relativePos) {
    self.relativePos = relativePos
  },
})).component(class TooltipEnvelope extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { arrow, relativePos, content, shadowFilter } = data
    return (
      <STooltipEnvelope {...restProps} arrow={arrow} pos={relativePos} >
        <TooltipContent filter={shadowFilter} arrow={arrow} pos={relativePos} >
          {metaElement(content)}
        </TooltipContent>
      </STooltipEnvelope>
    )
  }
}).demo(class TooltipEnvelopeDemoClass extends React.Component {
  constructor (props) {
    super(props)
    this.demo = List.create({
      innerCss: cssInject(css`
        display: flex;
        flex-direction: row;
      `),
      items: [true, false].map(arrow => List.create({
        innerCss: cssInject(css`
          display: flex;
          flex-direction: column;
        `),
        items: Positions.map(pos => TooltipEnvelope.create({
          relativePos: pos,
          arrow: arrow,
          content: Label.create({
            innerCss: cssInject(css`
              max-width: 6rem;
            `),
            text: pos,
          }),
          outerCss: cssInject(css`
            height: 3rem;
            width: 10rem;
          `),
        })),
      })),
    })
  }

  render () {
    return metaElement(this.demo)
  }
})

export default TooltipEnvelope
