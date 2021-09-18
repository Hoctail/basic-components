import React from 'react'
import styled from 'styled-components'
import EmailValidator from 'email-validator'
import PropTypes from 'prop-types'
import { plugin } from '@hoc/plugins-core'

import { InputInterfaceModel } from './models/inputInterface'
import { StyledTextModel } from './models/styledText'

const SInput = styled.input`
  padding: 0;
  text-align: left;
  outline: none;
  appearance: none;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ appColors, valid, coloredOnError }) => (
    appColors.name(coloredOnError && !valid ? 'errtext' : 'text')
  )};
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

/**
 * @classdesc
 * Extends {@link module:components.EventsModel EventsModel}.
 * Basic component for email input, making email validation.
 * If valid it sets `valid` flag to `true` or else to `false`.
 * @public
 * @extends module:components.StyledTextModel
 * @extends module:components.InputInterfaceModel
 * @class module:components.InputEmail
 * @static
 * @hideconstructor
*/
export const InputEmail = plugin('InputEmail', StyledTextModel, InputInterfaceModel, {
  /**
   * @public
   * @memberof module:components.InputEmail#
   * @type {string}
   * @default ''
   * @data
  */
  text: '',
  /**
   * If valid it sets `valid` flag to `true` or else to `false`.
   * @public
   * @memberof module:components.InputEmail#
   * @type {boolean}
   * @default false
   * @data
  */
  valid: false,
  /**
   * @public
   * @memberof module:components.InputEmail#
   * @type {boolean}
   * @default true
   * @data
  */
  autoFocus: true,
  /**
   * @public
   * @memberof module:components.InputEmail#
   * @type {boolean}
   * @default false
   * @data
  */
  readonly: false,
  /**
   * @public
   * @memberof module:components.InputEmail#
   * @type {boolean}
   * @default true
   * @data
  */
  coloredOnError: true,
  /**
   * @public
   * @memberof module:components.InputEmail#
   * @default onChange
   * @data
  */
  defaultEvents: {
    onChange: 'InputEmail.TextChanged',
  },
}).views(self => ({
  get inputValue () {
    return self.text
  },
})).actions(self => ({
  setInputValue (value) {
    self.setText(value)
  },
  /**
   * @public
   * @memberof module:components.InputEmail#
   * @param {string} text
   * @action
  */
  setText (text) {
    self.text = text
    self.valid = EmailValidator.validate(text)
  },
  /**
   * @public
   * @memberof module:components.InputEmail#
   * @param {boolean} [readonly=true]
   * @action
  */
  setReadOnly (readonly = true) {
    self.readonly = readonly
  },
})).component(class InputEmail extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { text, readonly, appColors, textCss, bgcolor, valid, coloredOnError, fancy } = data
    return (
      <SInput appColors={appColors}
        bgcolor={bgcolor}
        valid={valid} fancy={fancy}
        coloredOnError={coloredOnError}
        value={text} readOnly={readonly} textCss={textCss}
        {...restProps}
      />
    )
  }
}).events({
  TextChanged: ({ self, event }) => {
    self.setText(event.target.value)
  },
})

export default InputEmail
