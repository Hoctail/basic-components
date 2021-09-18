import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { types } from 'mobx-state-tree'
import { plugin, CssModel, cssInject, metaElement, typePlugin } from '@hoc/plugins-core'

import { Label } from './Label'
import { StyledTextModel } from './models/styledText'

const SDateInput = styled.input`
  font-family: Montserrat, sans-serif;
  ${({ textCss }) => textCss}
  color: ${({ appColors }) => appColors.name('text')};
  ${({ bgcolor }) => bgcolor ? `background: ${bgcolor};` : ''}
`

export const DatePicker = plugin('DatePicker', StyledTextModel, {
  enterEditModeOnEvent: 'onClick',
  innerCss: types.optional(CssModel, cssInject(css`
    font-family: Lato, sans-serif;
    overflow: auto;
    outline: none;
    border: none;
    text-overflow: ellipsis;
    padding-left: 6px;
    padding-right: 6px;
    text-align: center;
    display: inline-block;
    resize: none;
    max-height: inherit;
    height: auto;
  `)),
  display: typePlugin(Label, p => p.create({
    innerCss: cssInject(css`
      font-family: Lato, sans-serif;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 6px;
      padding-right: 6px;
      text-align: center;
      flex-grow: 1;
    `),
  })),
  editingMode: false,
  readonly: false,
  date: types.maybeNull(types.Date),
  defaultEvents: {
    onChange: 'DatePicker.onChange',
    onBlur: 'DatePicker.BlurInputDone',
  },
  autoFocus: true,
}).views(self => ({
  get dateForLabel () {
    return self.date ? self.date.toLocaleDateString('en-US') : ''
  },
  get dateForInput () {
    if (!self.date) return ''
    const year = `${self.date.getFullYear()}`.padStart(4, '0')
    const month = `${self.date.getMonth() + 1}`.padStart(2, '0')
    const day = `${self.date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  },
})).actions(self => ({
  afterCreate () {
    self.display.setEvents({
      [self.enterEditModeOnEvent]: 'DatePicker.EnableEditMode',
    })
  },
  setEditMode (editMode) {
    if (self.readonly && editMode) return
    self.editingMode = editMode
    self.display.setVisible(!editMode)
  },
  setBold (bold = true) {
    self.display.setBold(bold)
  },
  setDate (date) {
    try {
      if (date) {
        self.date = new Date(date)
        self.display.setText(self.dateForLabel)
      }
    } catch (e) {
      console.log(`setDate error: ${e.message} while setting "${date}"`)
    }
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
        if (cb(self.date, false) === false) {
          // if observer has returned false then return back to edit mode
          self.setEditMode(true)
        }
      }
    })
    self.onTrack('EditingDate', () => self.date, () => {
      if (self.editingMode) {
        cb(self.date, true)
      }
    })
  },
})).component(class DatePickerClass extends React.Component {
  static propTypes = { data: PropTypes.object }

  render () {
    const { data, ...restProps } = this.props
    const { editingMode, display, appColors, bgcolor, textCss, dateForInput } = data
    return editingMode
      ? <SDateInput type="date"
        value={dateForInput}
        appColors={appColors}
        textCss={textCss}
        bgcolor={bgcolor}
        {...restProps}
      />
      : metaElement(display)
  }
}).events({
  EnableEditMode: ({ self }) => {
    self.setEditMode(true)
  },
  BlurInputDone: ({ self }) => {
    self.setEditMode(false)
  },
  onChange: ({ self, event }) => {
    self.setDate(event.target.value)
  },
})

export default DatePicker
