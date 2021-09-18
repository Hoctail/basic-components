import { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import { cssInject, plugin, typePlugin, createModel } from '@hoc/plugins-core'

import { Dialog } from './Dialog'
import { List } from './List'
import { Label } from './Label'

export const MessageDialog = plugin('MessageDialog', {
  // 'buttons' array should be passed to constructor
  titleText: types.maybeNull(types.string),
  messageText: types.maybeNull(types.string),
  snapshot: typePlugin(Dialog, p => p.create({
    visible: false,
    content: [
      Label.create({
        innerCss: cssInject(css`
          padding: 1rem;
          text-align: center;
        `),
      }),
    ],
    buttons: List.create({
      innerCss: cssInject(css`
        display: flex;
        bottom: 1.5rem;
        padding: 1.5rem;
        justify-content: space-evenly;
      `),
      events: {
        onClick: 'MessageDialog.Clicked',
      },
    }),
  })),
}).views(self => ({
  get buttons () {
    return self.dialog.buttons.items
  },
  get dialog () {
    return self.snapshot
  },
})).actions(self => ({
  afterCreate () {
    self.setTitle(self.titleText)
    self.setMessageText(self.messageText)
  },
  setTitle (title) {
    self.dialog.setTitle(title)
  },
  setMessageText (message) {
    self.messageText = message
    self.dialog.content.items[0].setText(message)
  },
  show () {
    self.dialog.show()
  },
  hide () {
    self.dialog.hide()
  },
})).constructor((model, props) => {
  const { buttons, ...restProps } = props
  const self = createModel(model, restProps)
  self.dialog.buttons.setItems(buttons)
  return self
}).events({
  Clicked ({ self, event }) {
    self.hide()
    event.stopPropagation()
  },
})

export default MessageDialog
