import React from 'react'
import { Link } from 'react-router-dom'
import { plugin, metaElement, dynamicModelsTypes } from '@hoc/plugins-core'
import { types } from 'mobx-state-tree'

export const RouterLink = plugin('RouterLink', {
  route: types.string,
  item: types.late(() => types.union(dynamicModelsTypes(), types.string)),
}).component(props => {
  const { data, ...restProps } = props
  const { route, item } = data
  return typeof item === 'string'
    ? <Link {...restProps}>{item}</Link>
    : (
      <Link style={{
        color: 'inherit',
        textDecoration: 'inherit',
      }} to={`/${route}`} {...restProps} >{metaElement(item)}</Link>
    )
})

export default RouterLink
