import React from 'react'
import styled, { css } from 'styled-components'
import { cssInject, metaElement, plugin, typePlugin } from '@hoc/plugins-core'

import { Dialog } from './Dialog'
import { List } from './List'
import { Button } from './Button'
import { Input } from './Input'

const SInputDialog = styled.div``

export const InputDialog = plugin('InputDialog', {
  dialog: typePlugin(Dialog, p => p.create({
    visible: false,
    title: 'Input value',
    content: [
      Input.create({
        innerCss: cssInject(css`
          display: flex;
          padding: 0 1.5rem 0 1.5rem;
        `),
        events: {
          onKeyUp: 'InputDialog.onKeyUp',
          onInput: 'InputDialog.onInput',
          onChange: 'InputDialog.onChange',
        },
      }),
    ],
    buttons: List.create({
      innerCss: cssInject(css`
        display: flex;
        bottom: 1.5rem;
        padding: 1.5rem;
      `),
      items: [
        Button.create({
          name: 'Save',
          events: {
            onClick: 'InputDialog.Save',
          },
        }),
        Button.create({
          name: 'Cancel',
          disabled: false,
          btnStyle: 'link',
          events: {
            onClick: 'InputDialog.Cancel',
          },
        }),
      ],
    }),
  })),
}).views(self => ({
  get input () {
    return self.dialog.content.items[0]
  },
  get buttons () {
    return self.dialog.buttons.items
  },
})).actions(self => ({
  setTitle (title) {
    self.dialog.setTitle(title)
  },
  setButtonsNames (namesArray) {
    self.buttons.forEach((button, idx) => {
      button.setName(namesArray[idx])
    })
  },
  setInputText (text) {
    self.input.setText(text)
  },
  show (obj) {
    const { title, buttons, value } = obj
    if (title) self.setTitle(title)
    if (buttons) self.setButtonsNames(buttons)
    if (value !== undefined) self.setInputText(value)
    self.dialog.show()
  },
  hide () {
    self.dialog.hide()
  },
  save () {
    const observer = self.getObserver()
    if (observer) {
      observer(self.input.text)
    }
  },
})).actions(self => {
  let _observer
  function setObserver (cb) {
    _observer = cb
    self.onDestroy(() => {
      _observer = null
    })
  }
  function getObserver () {
    return _observer
  }
  function removeObserver () {
    _observer = null
  }
  return { setObserver, getObserver, removeObserver }
}).component(({ data, ...restProps }) => {
  const { dialog } = data
  return (
    <SInputDialog {...restProps} >
      {metaElement(dialog)}
    </SInputDialog>
  )
}).events({
  onKeyUp: ({ self, event }) => {
    if (event.keyCode === 13) self.save()
  },
  onInput: ({ self, event }) => {
    self.setInputText(event.target.value)
  },
  onChange: ({ event }) => {
    self.setInputText(event.target.value)
  },
  Save: ({ self }) => {
    self.save()
  },
  Cancel: ({ self }) => {
    self.hide()
  },
})

export default InputDialog
