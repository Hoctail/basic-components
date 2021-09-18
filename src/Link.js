import React from 'react'
import { types } from 'mobx-state-tree'
import { plugin, metaElement, dynamicModelsTypes } from '@hoc/plugins-core'

export const Link = plugin('Link', {
  href: types.string,
  target: types.string,
  item: types.late(() => types.union(dynamicModelsTypes(), types.string)),
}).actions(self => ({
  setHRef (href) {
    self.href = href
  },
})).component(props => {
  const { data, ...restProps } = props
  const { href, target, item } = data
  return typeof item === 'string'
    ? <a {...restProps}>{item}</a>
    : (
      <a href={href} target={target} style={{
        color: 'inherit',
        textDecoration: 'inherit',
      }} {...restProps} >{metaElement(item)}</a>
    )
})

export default Link
