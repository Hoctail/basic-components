import styled, { css } from 'styled-components'
import React, { Component } from 'react'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import { plugin } from '@hoc/plugins-core'

// div vs button as of unwanted focus side-effect

const SButton = styled.div`
  width: 6rem;
  height: 1.75rem;
  box-sizing: border-box;
  font-family: Montserrat, sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  outline: none;
  ${props => props.disabled ? css`
    `
    : css`
      &:hover {
        cursor: pointer;
        opacity: 0.7;
      }
    `
  }
  ${props => props.btnStyle === 'link' ? css`
    background: #FFFFFF;
    border: none;
    color: #637280;
  `
  : css`
    background: ${props => props.disabled ? '#D8DFE5' : '#FFBF00'};
    border: 1px solid ${props => props.disabled ? '#D8DFE5' : '#FFBF00'} ;
    border-radius: 5px;
    color: #FFFFFF;
    box-shadow: ${props => props.disabled ? 'none' : '0px 2px 2px rgba(254, 212, 39, 0.2)'};
  `
  }
`

export const Button = plugin('Button', {
  name: 'Button 1',
  btnStyle: types.optional(types.enumeration('Style', [
    'standard',
    'link',
  ]), 'standard'),
  disabled: false,
}).actions(self => ({
  afterCreate () {
    self.enableButton(!self.disabled)
  },
  /**
   * Enabling button changes appearence and allows all events
   * Disabling button will deny only 'onClick' event
   * @public
   * @param {boolean} enable
  */
  enableButton (enable) {
    self.disabled = !enable
    self.setDisableEvents(enable ? false : ['onClick'])
  },
  setName (name) {
    self.name = name
  },
})).component(class ButtonClass extends Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { name } = data
    return (
      <SButton {...restProps} {...data} >{name}</SButton>
    )
  }
}).demo(true, () => Button.create({
  name: 'Demo',
  events: {
    onClick: 'Button.DemoClicked',
  },
})).events({
  DemoClicked: () => {
    alert('Clicked')
  },
})

export default Button
