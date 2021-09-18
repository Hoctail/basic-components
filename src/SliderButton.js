import React, { Component } from 'react'
import styled from 'styled-components'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import { plugin } from '@hoc/plugins-core'

const SSliderButton = styled.div`
  display: flex;
  height: 1rem;
  align-items: center;
`
const SSlider = styled.div`
  width: 1.5rem;
  height: 0.75rem;
  border: 0.5px solid #E5E5E5;
  box-sizing: border-box;
  border-radius: 50px;
  background: ${props => ((props.pos === 'left') ? props.leftColor : props.rightColor) || '#959595'};
  display: flex;
  align-items: center;
  position: relative;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  &:hover {
    cursor: pointer;
  }
`

const SKnob = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  background: linear-gradient(0deg, #FFFFFF, #FFFFFF), #50DBE5;
  border: 0.5px solid #E5E5E5;
  border-radius: 50px;
  position: absolute;
  left: ${props => (props.pos === 'left') ? 0 : 'auto'};
  right: ${props => (props.pos === 'left') ? 'auto' : 0};
  transition: all 0.2s linear;
`

export const SliderButton = plugin('SliderButton', {
  leftColor: '#F25A09',
  rightColor: '#00CC2D',
  pos: types.optional(
    types.enumeration('Pos', ['left', 'right']),
    'left',
  ),
  defaultEvents: {
    // If onClick is not redefined it will trigger handler call on click
    onClick: 'SliderButton.Clicked',
  },
}).actions(self => ({
  setPos (pos) {
    self.pos = pos
  },
  switch () {
    self.pos = self.pos === 'left' ? 'right' : 'left'
  },
})).component(class RadioButtonClass extends Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { leftColor, rightColor, pos } = data
    return (
      <SSliderButton {...restProps}>
        <SSlider
          leftColor={leftColor} rightColor={rightColor} pos={pos}
        >
          <SKnob pos={pos}/>
        </SSlider>
      </SSliderButton>
    )
  }
}).demo(true, () => SliderButton.create()).events({
  Clicked: ({ self }) => {
    self.switch()
  },
})

export default SliderButton
