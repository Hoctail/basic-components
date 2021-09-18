import React from 'react'
import styled, { css } from 'styled-components'
import { getRoot } from 'mobx-state-tree'
import { plugin, cssInject, Plugins, registerPlugin } from '@hoc/plugins-core'
import { StyledTextModel } from './models/styledText'

const SLabel = styled.label`
  font-family: Montserrat, sans-serif;
  ${({ textCss }) => textCss}
  color: ${({ color, appColors }) => color || appColors.name('text')};
  ${({ bgcolor }) => bgcolor ? `background: ${bgcolor};` : ''}
`

export const Label = plugin('Label', StyledTextModel, {
  text: '',
  bold: false,
  bind: '',
}).actions(self => ({
  setBold (bold) {
    self.bold = bold
  },
  setText (text) {
    text = text == null ? '' : text
    self.text = text
  },
  copyToClipboard () {
    self.element.select()
    document.execCommand('copy')
    self.element.setSelectionRange(0, 0)
  },
})).component(({ data, ...restProps }) => {
  const { appColors, textCss, text, bgcolor, color } = data
  return (
    <SLabel appColors={appColors} textCss={textCss} bgcolor={bgcolor} color={color}
      {...restProps}
    >{text}</SLabel>
  )
}).demo(true, () => {
  const List = Plugins.get('List')
  const TooltipMessage = Plugins.get('TooltipMessage')
  return List.create({
    items: [
      TooltipMessage.create({
        relativePos: 'top-right',
      }),
      List.create({
        innerCss: cssInject(css`
        display: flex;
        flex-direction: column;
      `),
        items: ['tiny', 'small', 'normal', 'big', 'huge'].map(size => List.create({
          innerCss: cssInject(css`
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
        `),
          items: ['normal', 'bold'].map(weight => List.create({
            innerCss: cssInject(css`
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
          `),
            items: ['normal', 'italic'].map(style => Label.create({
              innerCss: cssInject(css`
              white-space: nowrap;
            `),
              events: {
                onMouseEnter: 'Label.MessageShow',
                onMouseLeave: 'Label.MessageHide',
              },
              outerCss: cssInject(css`
              padding: 0.5rem;
            `),
              text: `${
              size}${
              weight !== 'normal' ? `-${weight}` : ''}${
              style !== 'normal' ? `-${style}` : ''}`,
              size,
              style,
              weight,
            })),
          })),
        })),
      }),
    ],
  })
}).events({
  MessageShow: ({ self, data }) => {
    const list = getRoot(data)
    list.items[0].showMessage(data, `size: ${self.size
    }; weight: ${self.weight
    }; style: ${self.style}`, { timeout: 3000 })
  },
  MessageHide: ({ data }) => {
    const list = getRoot(data)
    list.items[0].hide()
  },
})
registerPlugin(Label)

export default Label
