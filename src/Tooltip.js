import React from 'react'
import styled, { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import {
  metaElement,
  createModel,
  cssInject,
  plugin,
  typePlugin,
} from '@hoc/plugins-core'

import { List } from './List'
import { CheckBox } from './CheckBox'
import { Label } from './Label'
import { Portal } from './Portal'
import { TooltipEnvelope } from './TooltipEnvelope'
import { Relative } from './Relative'

import { RectModel, Positions } from './models/rect'

const isDOM = el => el instanceof Element
const ensureElement = el => el ? (isDOM(el) ? el : el.element) : null
const invertSide = sideName => {
  switch (sideName) {
    case 'top': return 'bottom'
    case 'bottom': return 'top'
    case 'left': return 'right'
    case 'right': return 'left'
  }
}
function invertSideIfNeeded (sideName, delta, rect) {
  let res = sideName
  // dev.log('checkAndInvertSide', sideName, delta, rect,
  //   `delta=${JSON.stringify(delta)}`,
  //   `w=${rect.width}`, `h=${rect.height}`,
  // )
  if (sideName === 'right' && delta.right < rect.width) {
    res = invertSide(sideName)
  } else if (sideName === 'left' && delta.left < rect.width) {
    res = invertSide(sideName)
  }

  if (sideName === 'top' && delta.top < rect.height) {
    res = invertSide(sideName)
  } else if (sideName === 'bottom' && delta.bottom < rect.height) {
    res = invertSide(sideName)
  }
  return res
}

function invertSideOrNull (sideName, delta, rect) {
  const invert1 = invertSideIfNeeded(sideName, delta, rect)
  // if side not inverted then side is ok
  if (sideName === invert1) return sideName
  else {
    const invert2 = invertSideIfNeeded(invert1, delta, rect)
    // if inverted side is not reverted again then it's ok
    if (invert1 === invert2) return invert1
  }
  return null
}

function suggestRelativePos (origRelativePos, delta, rect) {
  let pos
  let split = origRelativePos.split('-')
  split[0] = invertSideOrNull(split[0], delta, rect)
  if (split.length > 1) split[1] = invertSideOrNull(split[1], delta, rect)
  split = split.filter(pos => pos != null)

  if (split.length) pos = split.join('-')
  else {
    pos = invertSideOrNull('right', delta, rect)
    if (!pos) pos = invertSideOrNull('bottom', delta, rect)
    if (!pos) pos = 'bottom' // can't return no pos
  }

  if (origRelativePos !== pos) {
    if (process.NODE_ENV === 'development') {
      console.log('suggestRelativePos', origRelativePos, '->', pos)
    }
  }
  return pos
}

const STooltip = styled.div``

export const Tooltip = plugin('Tooltip', {
  visible: false,
  parentRect: types.optional(RectModel, {}),
  portal: typePlugin(Portal, p => p.create({
    doNotPropagateEvents: [],
    content: Relative.create({
      content: TooltipEnvelope.create({
        content: null,
      }),
      events: {
        onComponentDidMount: 'Tooltip.RelativeDidMount',
      },
    }),
  })),
  // following fields are autofix related
  relativePosAutoFix: true,
  origRelativePos: '',
}).links(self => ({
  relativePos: self.portal.content.relativePos,
  relative: self.portal.content,
  envelope: self.portal.content.content,
  content: self.portal.content.content.content,
})).views(self => ({
  get content () {
    return self.links.content
  },
})).actions(self => ({
  setOrigRelativePos (relativePos) {
    self.origRelativePos = relativePos
  },
  setRelativePos (relativePos) {
    self.links.relative.setRelativePos(relativePos)
    self.links.envelope.setRelativePos(relativePos)
    if (!self.origRelativePos.length) {
      self.setOrigRelativePos(relativePos)
    }
  },
  setArrow (arrow) {
    self.links.envelope.setArrow(arrow)
  },
  setContent (content) {
    self.links.envelope.setContent(content)
  },
  hide () {
    self.setVisible(false)
  },
  checkFixRelativePos () {
    if (
      !self.relativePosAutoFix ||
      !self.links.envelope.element ||
      !self.links.relative.element
    ) return
    const clientRect = self.links.relative.element.getBoundingClientRect()
    const rect = self.links.envelope.element.getBoundingClientRect()
    const bodyRect = document.body.getBoundingClientRect()
    const delta = {
      top: clientRect.y - bodyRect.y,
      left: clientRect.x - bodyRect.x,
      bottom: bodyRect.height - (clientRect.y + clientRect.height),
      right: bodyRect.width - (clientRect.x + clientRect.width),
    }
    self.setRelativePos(
      suggestRelativePos(self.origRelativePos, delta, rect),
    )
    // console.log('checkFixRelativePos', self.origRelativePos, '->', self.links.relativePos)
  },
  showTooltip (relativeItem, offset = [0, 0]) {
    self.links.relative.setParent(relativeItem)
    self.links.relative.setOffset(offset)
    self.setVisible(true)
    self.checkFixRelativePos()
  },
  handleTooltipWhenAreaIsScrolling (...elements) {
    elements.forEach((scrollingElement) => {
      const el = ensureElement(scrollingElement)
      if (el) self.links.relative.startObservingScrollElement(el)
    })
  },
})).constructor((model, props) => {
  const { arrow, content, relativePos, ...restProps } = props
  const res = createModel(model, {
    type: 'Tooltip',
    visible: false,
    ...restProps,
  })
  res.setRelativePos(relativePos)
  res.setContent(content)
  res.setArrow(arrow)
  return res
}).component(class Tooltip extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { portal, checkFixRelativePos } = data
    // render in a place where data.element is guarantied to be exist
    // can't relay on did mount as it only called once.
    // Making an action call outside of tx, as it touches no significant or persistent data
    window.requestAnimationFrame(() => checkFixRelativePos())
    return (
      <STooltip {...restProps} >
        {metaElement(portal)}
      </STooltip>
    )
  }
}).events({
  RelativeDidMount: (args) => {
    const self = Tooltip.self(args.data)
    self.checkFixRelativePos()
  },
}).demo(class TooltipEnvelopeDemoClass extends React.Component {
  constructor (props) {
    super(props)
    this.demo = List.create({
      innerCss: cssInject(css`
        display: flex;
        flex-direction: column;
      `),
      items: [
        Positions.slice(0, 3),
        Positions.slice(3, 6),
        Positions.slice(6, 9),
      ].map(segment => List.create({
        innerCss: cssInject(css`
          display: flex;
          flex-direction: row;
        `),
        items: segment.map(pos => {
          const checkbox = CheckBox.create()
          const tooltip = Tooltip.create({
            relativePos: pos,
            arrow: true,
            content: List.create({
              items: [
                Label.create({
                  text: pos,
                }),
              ],
            }),
          })
          checkbox.setCheckObserver(checked => {
            if (checked) {
              tooltip.showTooltip(checkbox)
              tooltip.handleTooltipWhenAreaIsScrolling(
                document.querySelector('[data-testid="App"]'),
              )
            } else tooltip.hide()
          })
          const res = List.create({
            innerCss: cssInject(css`
              padding: 1rem;
              width: 3rem;
              height: 3rem;
            `),
            items: [
              checkbox,
              Label.create({ text: pos }),
              tooltip,
            ],
          })
          return res
        }),
      })),
    })
  }

  render () {
    return metaElement(this.demo)
  }
})

export default Tooltip
