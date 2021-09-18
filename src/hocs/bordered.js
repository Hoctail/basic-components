import React from 'react'
import styled, { css } from 'styled-components'
import { observer } from 'mobx-react'

export function bordered (ItemComponent) {
  const HocBorderedItem = styled(ItemComponent)`
    width: ${props => props.data.width};
    height: ${props => props.data.height};
    background: ${props => props.data.background};    
    border-radius: ${props => props.data.borderRadius};
    ${props => props.disabled ? '' : css`
      &:hover {
        cursor: pointer;
      }`
    };
  `
  return observer(HocBorderedItem)
}
