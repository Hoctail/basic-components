import React from 'react'
import styled from 'styled-components'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import { plugin } from '@hoc/plugins-core'

import { StyledTextModel } from './models/styledText'
import { InputInterfaceModel } from './models/inputInterface'

const STextArea = styled.textarea`
  // https://stackoverflow.com/questions/43201862/strange-behaviour-with-textarea-autogrow-and-css-box-sizing
  box-sizing: border-box;
  height: ${props => {
    return props.height ? `${props.height}px` : 'auto'
  }};
  color: ${({ appColors }) => appColors.name('text')};
  ${({ bgcolor }) => bgcolor ? `background: ${bgcolor};` : ''}
  font-family: Montserrat, sans-serif;
  ${({ textCss }) => textCss}
  ${({ fancy }) => fancy ? 
    `text-overflow: ellipsis;
    box-shadow: 0px 0px 2px rgba(99, 114, 128, 0.5);
    &:focus {
      box-shadow: inset 0 0 2px '#FFBF00';
    }` : ''
  }  
`

export const TextAreaAutosize = plugin('TextAreaAutosize', StyledTextModel, InputInterfaceModel, {
  height: types.maybeNull(types.integer),
  text: '',
  readonly: false,
  defaultEvents: {
    onComponentDidMount: 'TextAreaAutosize.DidMount',
    onChange: 'TextAreaAutosize.Changed',
  },
}).views(self => ({
  get inputValue () {
    return self.text
  },
})).actions(self => ({
  setInputValue (value = '') {
    self.setText(value)
  },
  setText (text) {
    self.text = text
    const el = self.element
    if (el) {
      self.setHeight(el.scrollHeight)
    }
  },
  moveCursorToEnd () {
    const el = self.element
    if (el) {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  },
  setHeight (height) {
    self.height = height
  },
  setReadOnly (readonly = true) {
    self.readonly = readonly
  },
})).component(class TextAreaClass extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { text, textCss, readonly, height, appColors, bgcolor, fancy } =
      data
    return <STextArea appColors={appColors} bgcolor={bgcolor}
      textCss={textCss} value={text}
      readOnly={readonly} height={height} fancy={fancy}
      {...restProps}
    />
  }
}).events({
  DidMount: ({ self }) => {
    // TODO: wont't call DidMount in form mode,
    // as won't lose focus in form node
    // console.log('DidMount', self.text)
    // replace text should trigger UPDATE RECT for TextAreaAutosize
    // Doing it here as TextAreaAutosize have no own render class
    self.setText(self.text)
    if (self.moveCursorToEnd) self.moveCursorToEnd()
  },
  Changed: ({ self, event }) => {
    if (!self.readonly) self.setText(event.target.value)
    event.stopPropagation()
  },
})

export default TextAreaAutosize
