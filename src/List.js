import React from 'react'
import styled from 'styled-components'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import {
  dynamicModelsTypes,
  metaElement,
  plugin,
} from '@hoc/plugins-core'

import { Label } from './Label'

const SList = styled.div``

/**
 * @classdesc
 * Extends {@link module:components.EventsModel EventsModel}.
 * ### Creating node's instance
 * ``` js
 * List.create({
 *   items: [],
 * })
 * ```
 * <br>For example refer our <a href="tutorial-howto.html#create-list">Cheat Sheet</a>
 * @public
 * @class module:components.List
 * @static
 * @hideconstructor
*/
export const List = plugin('List', {
  /**
   * will display `emptyMessage` when `allowEmptyMessage=true` and list is empty.
   * @public
   * @memberof module:components.List#
   * @type {boolean}
   * @default false
   * @data
  */
  allowEmptyMessage: false,
  /**
   * @public
   * @memberof module:components.List#
   * @type {Array< module:components.PluginComponent >}
   * @data
   * @default []
  */
  items: types.array(
    types.late(() => dynamicModelsTypes()),
  ),
  /**
   * centered text can be displayed in empty list if `allowEmptyMessage` is set true
   * @public
   * @memberof module:components.List#
   * @type {?string}
   * @data
   * @default null
  */
  emptyMessage: types.maybeNull(Label.Model),
  /**
   * mapping is only needed to have names for components in a `List.items`
   * mapping.key - name of list item
   * mapping.value - array item index
   * @public
   * @memberof module:components.List#
   * @type {?Map<string, number>}
   * @data
   * @default null
  */
  mapping: types.maybeNull(types.map(types.integer)),
}).actions(self => ({
  /**
   * Clear list
   * @public
   * @memberof module:components.List#
   * @action
   * @param {number} startingFromPos if starting pos not specified all list will be cleared
  */
  clear (startingFromPos) {
    self.items.splice(startingFromPos)
  },
  _ensureMappingExists () {
    if (!self.mapping) self.mapping = {}
  },
  /**
   * @public
   * @memberof module:components.List#
   * @action
   * @param {Array<Components>} items
  */
  setItems (items) {
    self.items = items
  },
  /**
   * @public
   * @memberof module:components.List#
   * @action
   * @param {Component} item
  */
  addListItem (item) {
    self.items.push(item)
    const res = self.items[self.items.length - 1]
    return res
  },
  /**
   * not used
  */
  removeListItem (item) {
    self.items.remove(item)
  },
  /**
   * not used
  */
  removeListItemByIdx (idx) {
    self.removeListItem(
      self.items[idx],
    )
  },
  /**
   * Enable empty message and make empty message visible
   * @public
   * @memberof module:components.List#
   * @action
   * @param {boolean} enable
  */
  enableEmptyMessage (enable) {
    self.allowEmptyMessage = enable
    self.emptyMessage.setVisible(enable)
  },
  /**
   * Set empty message, enable it and make visible
   * @public
   * @memberof module:components.List#
   * @action
   * @param {string|module:components.Label} label either string or label
  */
  setEmptyMessage (label) {
    if (typeof label === 'string') {
      label = Label.create({ text: label })
    }
    self.emptyMessage = label
    self.enableEmptyMessage(true)
  },
})).views(self => ({
  /**
   * get list item by its mapping name
   * @public
   * @memberof module:components.List#
   * @view
   * @param {string} name
  */
  itemByMapping (name) {
    const idx = self.mapping ? self.mapping.get(name) : -1
    if (idx >= 0) return self.items[idx]
  },
  /**
   * get map items as an object { key - name, value - component }
   * @public
   * @memberof module:components.List#
   * @getter
   * @type {object}
  */
  get mapItems () {
    const res = {}
    if (self.mapping) {
      self.mapping.forEach((_, name) => {
        res[name] = self.itemByMapping(name)
      })
    }
    return res
  },
  /**
   * List items count
   * @public
   * @memberof module:components.List#
   * @getter
   * @type {number}
  */
  get length () {
    return self.items.length
  },
  /**
   * @public
   * @memberof module:components.List#
   * @getter
   * @type {boolean}
  */
  get isEmptyMessageShowing () {
    return self.allowEmptyMessage && self.items.length === 0
  },
})).component(class ListClass extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { items, emptyMessage, appColors } = data
    const components = items.map((item, idx) => (
      metaElement(item, { key: idx })
    ))
    return (
      <SList {...restProps} appColors={appColors} >
        {components.length ? components : metaElement(emptyMessage)}
      </SList>
    )
  }
})
registerPlugin(List)

export default List
