import React from 'react'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import { plugin, createModel } from '@hoc/plugins-core'

import { icons } from './icons/icons'

// TODO:
// Make svg icons displaying in a generic way, with a <use> tag

/**
 * Note: SvgIcon plugin doesn't support innerCss, use outerCss instead.
 * Svg icon can't be styled with generic css style
*/
export const SvgIcon = plugin('SvgIcon', {
  name: types.optional(
    types.enumeration('Names', Object.keys(icons)),
    'blank',
  ),
  width: types.maybeNull(types.string),
  height: types.maybeNull(types.string),
  fill: types.maybeNull(types.string),
}).views(self => {
  let _Icon
  return {
    // save Icon component in context, outside of model
    setIcon (Icon) {
      _Icon = Icon
    },
    get Icon () {
      if (icons[self.name]) return icons[self.name]
      else if (_Icon) return _Icon
      else throw new Error(`Unknown SvgIcon: ${self.name}`)
    },
  }
}).actions(self => ({
  setName (name) {
    self.name = name
  },
  beforeDestroy () {
    self.setIcon(null) // clear context
  }
})).constructor((model, props) => {
  const { Icon, ...restProps } = props
  const self = createModel(model, restProps)
  self.setIcon(Icon)
  return self
}).component(class SvgIcon extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    className: PropTypes.string,
  }

  render () {
    const { data, className } = this.props
    const { Icon, fill, width, height } = data
    return (
      <Icon className={className}
        {...(fill ? { fill: fill } : {})}
        width={width} height={height}
      />
    )
  }
})
export default SvgIcon
