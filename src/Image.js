import styled from 'styled-components'
import React from 'react'
import { types } from 'mobx-state-tree'
import { plugin } from '@hoc/plugins-core'

const SImage = styled.img`
`

export const Image = plugin('Image', {
  src: types.string,
}).actions(self => ({
  setImage (src) {
    self.src = src
  },
})).component(props => {
  const { data, ...restProps } = props
  const { src } = data
  return <SImage {...restProps} src={src} />
})

export default Image
