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

import { SvgButton } from './SvgButton'
import { List } from './List'
import { Portal } from './Portal'
import { Label } from './Label'

const SDialog = styled.div``

export const Dialog = plugin('Dialog', {
  visible: false,
  borderRadius: '0.3rem',
  fullscreen: false,
  portal: typePlugin(Portal, p => p.create({
    portalid: 'dialog',
    content: List.create({
      innerCss: cssInject(css`
        background: rgba(218, 218, 218, 0.5);
        position: fixed;
        height: 100vh;
        width: 100vw;
      `),
      items: [
        List.create({
          /* @media (max-width: 768px) {
            height: 95vh;
          } */
          outerCss: cssInject('payload', css`
            display: block;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            max-height: 95vh;
            max-width: 95vw;
            ${props => props.payload.get('fullscreen') ? `
              width: 100%;
              height: 100%;
            ` : ''}            
          `),
          // to avoid cutting round corners by content use - overflow: auto;
          // payload1 - was initialized with borderRadius
          innerCss: cssInject('payload1', css`
            display: flex;
            flex-direction: column;
            box-shadow: 0 0.25rem 1.5rem rgba(37, 38, 94, 0.1);
            border-radius: ${props => props.payload1};
            background: #FFFFFF;
            height: inherit;
            min-height: inherit;
            max-height: inherit;
            width: inherit;
            min-width: inherit;
            max-width: inherit;
            overflow: auto;
          `),
          items: [
            // title
            Label.create({
              outerCss: cssInject('payload1', css`
                padding: 1rem;
                ${props => props.payload1};
              `),
              innerCss: cssInject(css`
                font-family: Montserrat, sans-serif;
                font-style: normal;
                font-weight: normal;
                font-size: 12px;
                line-height: 15px;
                display: flex;
                align-items: center;
                color: #637280;
              `),
            }),
            // close button
            SvgButton.create({
              outerCss: cssInject(css`
                z-index: 1;
                position: absolute;
                left: 100%;
                transform: translate(-50%, -50%);
              `),
              testid: 'CloseDialogButton',
              name: 'smallcross',
              shape: 'circle',
              events: {
                onClick: 'Dialog.Close',
              },
            }),
            // content
            List.create({
              innerCss: cssInject('payload', css`
                  display: flex;
                  flex-direction: column;
                  overflow: auto;
                  z-index: 0;
                  min-width: inherit;
                  min-height: inherit;
                  ${props => props.payload.get('fullscreen') ? `
                  width: 100%;
                  height: 100%;
                ` : ''}                    
              `),
            }),
            // buttons
            List.create({
              testid: 'Buttons',
              innerCss: cssInject(css`
                display: flex;
                bottom: 1.5rem;
                padding: 1.5rem;
              `),
              visible: false,
            }),
          ],
        }),
      ],
    }),
  })),
}).views(self => ({
  get dialog () {
    return self.portal.content.items[0]
  },
  get title () {
    return self.dialog.items[0]
  },
  get closeButton () {
    return self.dialog.items[1]
  },
  get content () {
    return self.dialog.items[2]
  },
  get buttons () {
    return self.dialog.items[3]
  },
})).actions(self => ({
  afterCreate () {
    self.dialog.setPayload('fullscreen', self.fullscreen)
    self.content.setPayload('fullscreen', self.fullscreen)
  },
  show () {
    self.setVisible(true)
  },
  hide () {
    self.setVisible(false)
  },
  setCloseObserver (cb) {
    self.onTrack('CloseHandler', () => self.visible, visible => {
      if (!visible) {
        cb()
      }
    })
  },
  /**
   * Set dialog title. If title or title.text is empty
   * then title component will be hidden
   * @param {string|Plugin} title
  */
  setTitle (title) {
    if (title) {
      if (title && title.isPlugin) {
        self.dialog.items[0] = title
        if (!title.text) title.setVisible(false)
        else title.setVisible(true)
      } else {
        self.title.setText(title)
        self.title.setVisible(true)
      }
    } else self.title.setVisible(false)
  },
  setContent (content) {
    self.dialog.items[2].items = content
  },
  setButtons (buttons) {
    if (buttons) {
      self.dialog.items[3] = buttons
    }
  },
})).constructor((model, props) => {
  const { testid, title, content, buttons, portalid, innerCss, ...restProps } = props
  const res = createModel(model, {
    type: 'Dialog',
    ...restProps,
  })
  res.portal.content.setTestId(testid)
  res.portal.setPortalId(portalid)
  res.setTitle(title)
  res.setContent(content)
  res.setButtons(buttons)
  res.dialog.setPayload1(res.borderRadius)
  if (innerCss) res.dialog.setInnerCss(innerCss)
  return res
}).component(class Dialog extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { portal } = data
    return (
      <SDialog {...restProps} >
        {metaElement(portal)}
      </SDialog>
    )
  }
}).events({
  Close: ({ event, data }) => {
    Dialog.self(data).setVisible(false)
    event.preventDefault()
  },
  Escape: ({ event, data }) => {
    if (event.key === 'Esc' || event.keyCode === 27) {
      Dialog.self(data).setVisible(false)
      event.preventDefault()
    }
  },
})

export default Dialog
