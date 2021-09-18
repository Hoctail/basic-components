import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { plugin } from '@hoc/plugins-core'

import { InputInterfaceModel } from './models/inputInterface'
import { StyledTextModel } from './models/styledText'

const SInputNumber = styled.input`
  text-align: right;
  display: inline-block;
  padding: 0;
  text-align: right;
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

export const InputNumber = plugin('InputNumber', StyledTextModel, InputInterfaceModel, {
  number: 0,
  readonly: false,
  selectOnFocus: true,
  defaultEvents: {
    onFocus: 'InputNumber.Focused',
    onChange: 'InputNumber.ValueChanged',
  },
}).reactions(self => [
  [
    () => self.number,
    number => {
      // console.log(number)
    },
    'number',
  ],
]).views(self => ({
  get inputValue () {
    return `${self.number}`
  },
})).actions(self => ({
  setInputValue (value) {
    self.setNumber(value)
  },
  setNumber (number) {
    if (typeof number !== 'number') {
      try {
        self.number = JSON.parse(number)
      } catch {}
    } else {
      self.number = number
    }
  },
  setReadOnly (readonly = true) {
    self.readonly = readonly
  },
})).component(class CellNumberEditor extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { inputValue, readonly, appColors, textCss, bgcolor, fancy } = data
    return (
      <SInputNumber appColors={appColors} type="number"
        bgcolor={bgcolor} fancy={fancy}
        value={inputValue} readOnly={readonly} textCss={textCss}
        {...restProps}
      />
    )
  }
}).events({
  Focused: ({ self }) => {
    if (self.selectOnFocus) {
      const el = self.element
      if (el) el.select()
    }
  },
  ValueChanged: ({ self, event }) => {
    self.setNumber(event.target.value)
  },
}).demo(true, () => InputNumber.create())

export default InputNumber
