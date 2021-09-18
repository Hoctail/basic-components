import React from 'react'
import styled, { keyframes } from 'styled-components'
import PropTypes from 'prop-types'
import { plugin } from '@hoc/plugins-core'

const slide = keyframes`
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.5);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
`

export const StyledDot = styled.div`
  width: ${props => props.size || '32px'};
  height: ${props => props.size || '32px'};
  background: #3ac;
  border-radius: 100%;
  display: inline-block;
  animation: ${slide} 1.5s infinite;
  &:nth-child(1) {
    animation-delay: 0.2s;
    background: #FFEA2D;
  }
  &:nth-child(2) {
    animation-delay: 0.3s;
    background: #50DBE5;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
    background: #F25A09;
  }
`

const SDotSpinner = styled.div`
  display: flex;
  background-color: #f9f9f9;
  opacity: 0.6;
  padding-left: calc(${props => props.size} / 3);
  padding-top: calc(${props => props.size} / 3);
`

export const DotSpinner = plugin('DotSpinner', {
  size: '1rem',
}).actions(self => ({
})).component(class DotSpinner extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { size } = data
    return (
      <SDotSpinner size={size} {...restProps} >
        <StyledDot size={size} />
        <StyledDot size={size} />
        <StyledDot size={size} />
      </SDotSpinner>
    )
  }
}).demo(true, () => DotSpinner.create())

export default DotSpinner
