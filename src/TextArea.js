import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { plugin } from '@hoc/plugins-core'

import { StyledTextModel } from './models/styledText'
import { InputInterfaceModel } from './models/inputInterface'

const STextArea = styled.textarea`
  height: ${props => props.height ? `${props.height}px` : 'auto'};
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

export const TextArea = plugin('TextArea', StyledTextModel, InputInterfaceModel, {
  text: '',
  autoFocus: true,
  rows: 0,
  readonly: false,
  defaultEvents: {
    onChange: 'TextArea.TextChanged',
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
  },
  setReadOnly (readonly = true) {
    self.readonly = readonly
  },
})).component(class TextAreaClass extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { rows, text, textCss, readonly, appColors, bgcolor, fancy } =
      data
    return <STextArea appColors={appColors} bgcolor={bgcolor}
      rows={rows}
      value={text} readOnly={readonly}
      textCss={textCss} fancy={fancy} {...restProps} />
  }
}).events({
  TextChanged: ({ self, event }) => {
    self.setText(event.target.value)
  },
})

export default TextArea
