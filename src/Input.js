import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { plugin } from '@hoc/plugins-core'

import { StyledTextModel } from './models/styledText'
import { InputInterfaceModel } from './models/inputInterface'

const SInput = styled.input`
  padding: 0;
  text-align: left;
  outline: none;
  appearance: none;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
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

export function inputStyle () {
  return `
    text-overflow: ellipsis;
    box-shadow: 0px 0px 2px rgba(99, 114, 128, 0.5);
    &:focus {
      box-shadow: inset 0 0 2px '#FFBF00';
    }
  `
}

export const Input = plugin('Input', StyledTextModel, InputInterfaceModel, {
  text: '',
  autoFocus: true,
  readonly: false,
  defaultEvents: {
    onChange: 'Input.TextChanged',
  },
}).views(self => ({
  get inputValue () {
    return self.text
  },
})).actions(self => ({
  setInputValue (value) {
    self.setText(value)
  },
  setText (text) {
    self.text = text
  },
  setReadOnly (readonly = true) {
    self.readonly = readonly
  },
})).component(class Input extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { text, readonly, appColors, textCss, bgcolor, fancy } = data
    return (
      <SInput appColors={appColors}
        bgcolor={bgcolor}
        value={text} readOnly={readonly} textCss={textCss}
        fancy={fancy}
        {...restProps}
      />
    )
  }
}).events({
  TextChanged: ({ self, event }) => {
    self.setText(event.target.value)
  },
})

export default Input
