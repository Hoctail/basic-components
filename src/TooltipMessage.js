import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import {
  metaElement,
  cssInject,
  createModel,
  plugin,
  typePlugin,
} from '@hoc/plugins-core'

import { Input } from './Input'
import { Label } from './Label'
import { List } from './List'
import { Tooltip } from './Tooltip'
import { Portal } from './Portal'
import { Relative } from './Relative'
import { TooltipEnvelope } from './TooltipEnvelope'

const SWrapper = styled.div``

export const TooltipMessage = plugin('TooltipMessage', {
  text: '',
  tooltip: typePlugin(Tooltip, p => p.create({
    relativePos: 'top',
    arrow: true,
    // just define a custom portal with own color scheme
    // TODO: Remove this whole portal section after improving a tooltip
    portal: Portal.create({
      portalid: 'tooltip',
      doNotPropagateEvents: [],
      content: Relative.create({
        content: TooltipEnvelope.create({
          innerCss: cssInject('appColors', css`
            width: 10rem;
            background: ${({ appColors }) => appColors.idx(4)};
            border-color: ${({ appColors }) => appColors.idx(4)};
          `),
          content: null,
        }),
        events: {
          onComponentDidMount: 'TooltipMessage.RelativeDidMount',
        },
      }),
    }),
    content: Label.create({
      innerCss: cssInject('appColors', css`
        color: ${({ appColors }) => appColors.name('text')};
        display: flex;
        padding: 0.5rem;
        font-size: 0.75rem;
        font-family: Lato, sans-serif;
        hyphens: none;
      `),
    }),
  })),
}).actions(self => {
  let _timeoutHandle

  /** Show message text opposite to node,
   * message will hide after an interval.
   * node - a plugin node
  */
  function showMessage (node, text, options = {}) {
    const timeout = options.timeout ? options.timeout : 2000
    const relativePos = options.relativePos
      ? options.relativePos
      : self.tooltip.links.relativePos
    const prevRelativePos = self.tooltip.links.relativePos

    if (text) self.setText(text)
    if (self.text) {
      self.setRelativePos(relativePos)
      self.show(node)
      if (_timeoutHandle) window.clearTimeout(_timeoutHandle)
      if (timeout) {
        _timeoutHandle = window.setTimeout(() => {
          self.hide()
          self.setRelativePos(prevRelativePos)
          _timeoutHandle = null
        }, timeout)
      }
    }
  }
  function show (relativeNode) {
    self.tooltip.showTooltip(relativeNode)
  }
  function hide () {
    self.tooltip.hide()
  }

  return { showMessage, show, hide }
}).actions(self => ({
  setText (text) {
    self.text = text
    self.tooltip.links.content.setText(text)
  },
  setRelativePos (relativePos) {
    self.tooltip.setRelativePos(relativePos)
    self.tooltip.setOrigRelativePos(relativePos)
  },
})).constructor((model, props) => {
  const { text, relativePos, ...restProps } = props
  const res = createModel(model, restProps)
  res.setText(text)
  res.setRelativePos(relativePos)
  return res
}).component(class TooltipMessage extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { tooltip } = data
    return (
      <SWrapper {...restProps} >
        {metaElement(tooltip)}
      </SWrapper>
    )
  }
}).events({
  RelativeDidMount: (args) => {
    const self = TooltipMessage.self(args.data)
    self.tooltip.checkFixRelativePos()
  },
}).demo(class TooltipDemoClass extends React.Component {
  constructor (props) {
    super(props)
    this.demo = List.create({
      mapping: {
        input: 0,
        message: 1,
      },
      items: [
        Input.create({
          text: 'Type something here',
          events: {
            onChange: 'TooltipMessage.DemoTooltip',
          },
        }),
        TooltipMessage.create({
          relativePos: 'right',
        }),
      ],
    })
  }

  render () {
    return metaElement(this.demo)
  }
}).events({
  DemoTooltip: ({ data, event }) => {
    data.setText(event.target.value)
    const parentList = List.self(data)
    const message = parentList.itemByMapping('message')
    message.showMessage(data, 'Typing notification')
    message.tooltip.handleTooltipWhenAreaIsScrolling(
      document.querySelector('[data-testid="App"]'),
    )
  },
})


export function createTooltipError () {
  return TooltipMessage.create({
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
  })
}

export default TooltipMessage
