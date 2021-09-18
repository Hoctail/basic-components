import React from 'react'
import styled, { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import { plugin, metaElement, typePlugin } from '@hoc/plugins-core'

import { SvgIcon } from './SvgIcon'

const SCheckBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  svg {
    width: 11px;
    height: 8px;
    fill: #ffffff;
  }
  ${props => props.checked
    ? css`
      background: #00CC2D;
      box-shadow: 0 0 1px #637280;
    `
    : css`
      background: #ffffff;
      box-shadow: inset 0 0 3px ${props => props.appColor};
    `
  }
`

export const CheckBox = plugin('CheckBox', {
  checkIcon: typePlugin(SvgIcon, p => p.create({
    name: 'checkmark',
  })),
  checked: types.optional(types.boolean, false),
  focusable: types.optional(types.boolean, true),
  defaultEvents: {
    onClick: 'CheckBox.CheckBoxClicked',
    onKeyDown: 'CheckBox.CheckBoxKeyPressed',
  },
}).actions(self => ({
  setChecked (checked) {
    self.checked = checked
  },
  setCheckObserver (cb) {
    self.onTrack('CheckHandler', () => self.checked, checked => {
      cb(checked)
    })
  },
})).component(props => {
  const { data, ...restProps } = props
  const { checked, checkIcon } = data
  return (
    <SCheckBox role="checkbox" aria-checked={checked}
      checked={checked} {...restProps} >
      {checked ? metaElement(checkIcon) : null}
    </SCheckBox>
  )
}).events({
  CheckBoxClicked ({ data }) {
    data.setChecked(!data.checked)
  },
  CheckBoxKeyPressed ({ data, event }) {
    if (event.keyCode === 32) {
      data.setChecked(!data.checked)
      event.preventDefault()
    }
  },
})

export default CheckBox
