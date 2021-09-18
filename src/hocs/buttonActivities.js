import React, { Component } from 'react'
import styled, { css } from 'styled-components'

export function withButtonActivities (ItemComponent) {
  const ItemWithActivities = styled(ItemComponent)`
    box-shadow: ${props => props.data.boxShadow(props.pointerDown)};
    ${props => props.disabled ? css`
      opacity: ${props => props.data.opacityOnClick};
    ` : css`
      opacity: ${props => props.data.opacityActive};
      &:hover {
        cursor: pointer;
        opacity: ${props => props.data.opacityOnHover(props.pointerDown)};
      }
    `
    }
  `

  class HocWithActivities extends Component {
    constructor (props) {
      super(props)
      this.state = { pointerDown: false }
      this.onPointerDown = this.onPointerDown.bind(this)
      this.onPointerUp = this.onPointerUp.bind(this)
      this.onPointerLeave = this.onPointerLeave.bind(this)
    }

    onPointerDown () {
      this.setState({ pointerDown: true })
    }

    onPointerUp () {
      this.setState({ pointerDown: false })
    }

    onPointerLeave () {
      this.setState({ pointerDown: false })
    }

    render () {
      return (
        <ItemWithActivities {...this.props}
          pointerDown={this.state.pointerDown}
          onPointerDown={this.onPointerDown}
          onPointerUp={this.onPointerUp}
          onPointerLeave={this.onPointerLeave}
        />
      )
    }
  }

  return HocWithActivities
}
