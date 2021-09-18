import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'styled-components'
import {
  metaElement,
  cssInject,
  createModel,
  plugin,
  dynamicModelsTypes,
  typePlugin,
} from '@hoc/plugins-core'

import { Label } from './Label'
import { Input } from './Input'

export const Editor = plugin('Editor', {
  enterEditModeOnEvent: 'onClick',
  // input is something implementing InputInterfaceModel
  input: typePlugin(() => dynamicModelsTypes(), () => Input.create()),
  display: typePlugin(Label, p => p.create({
    innerCss: cssInject(css`
      color: #637280;
    `),
    visible: true,
  })),
  editingMode: false,
  readonly: false,
  bold: false,
  blurOnEnter: true,
}).reactions(self => [
  [
    () => self.input.inputValue,
    val => self.display.setText(val),
    'setText',
  ],
]).views(self => ({
  get text () {
    return self.input.inputValue
  },
})).actions(self => ({
  afterCreate () {
    self.input.setReadOnly(self.readonly)
    self.setBold(self.bold)
  },
  afterAttach () {
    // console.log('afterAttach Editor', self.toJSON())
  },
  setBold (bold = true) {
    self.bold = bold
    self.input.setBold(bold)
    self.display.setBold(bold)
  },
  setEditMode (editMode) {
    if (self.readonly && editMode) return
    self.editingMode = editMode
    self.display.setVisible(!editMode)
    self.input.setVisible(editMode)
  },
  toggleEditMode () {
    self.setEditMode(!self.editingMode)
  },
  setText (text) {
    // convert to string if value is not null and not string
    text = text != null && typeof text !== 'string' ? `${text}` : text
    self.display.setText(text)
    self.input.setInputValue(text)
  },
  setReadOnly (readonly) {
    self.readonly = readonly !== undefined ? readonly : true
  },
  setTextObserver (cb, debugName = '') {
    /**
     * Set callback (text, editing) => {} observing editing text,
     * editing is a boolean and true false is meaning text is entered;
     * if callback returned false and editing flag is false then
     * editor will return to edit mode.
    */
    self.onTrack(`TextEdited-${debugName}`, () => self.editingMode, () => {
      if (!self.editingMode) {
        if (cb(self.input.inputValue, false) === false) {
          // if observer has returned false then return back to edit mode
          self.setEditMode(true)
        }
      }
    })
    self.onTrack('EditingText', () => self.input.inputValue, () => {
      if (self.editingMode) {
        cb(self.input.inputValue, true)
      }
    })
  },
  copyToClipboard () {
    if (self.editingMode) self.input.copyToClipboard()
    else self.display.copyToClipboard()
  },
})).constructor((model, props) => {
  const { text, ...restProps } = props
  const self = createModel(model, {
    type: 'Editor',
    ...restProps,
  })
  // console.log('Editor', self.toJSON())
  self.setText(text)
  self.display.setEvents({
    [self.enterEditModeOnEvent]: 'Editor.EnableEditMode',
  })
  self.input.setEvents({
    onBlur: 'Editor.BlurInputDone',
    onKeyUp: 'Editor.onKeyUp',
  }, false)
  return self
}).component(class EditorClass extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { editingMode, input, display } = this.props.data
    return editingMode
      ? metaElement(input)
      : metaElement(display)
  }
}).events({
  EnableEditMode: ({ self }) => {
    self.setEditMode(true)
  },
  BlurInputDone: ({ self }) => {
    self.setEditMode(false)
  },
  onKeyUp: ({ self, event }) => {
    // console.log('Editor.onKeyUp', event.keyCode, self.blurOnEnter)
    // on enter or esc
    if ((event.keyCode === 13 && self.blurOnEnter) ||
        event.keyCode === 27
    ) {
      // React 16 and earlier
      // https://reactjs.org/docs/legacy-event-pooling.html
      event.persist()
      // trigger blur event asynchronously as synchronous call
      // will call blur event synchronously and corrupt transaction
      window.setTimeout(() => {
        if (event.target) event.target.blur()
      })
    }
  },
})

export default Editor
