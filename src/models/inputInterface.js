import { types } from 'mobx-state-tree'

/**
 * @classdesc
 * @public
 * @class module:components.InputInterfaceModel
 * @static
 * @hideconstructor
*/
export const InputInterfaceModel = types.model('InputInterface', {
  /**
   * Beautify component
   * @public
   * @memberof module:components.InputInterfaceModel#
   * @type {string|json|number}
   * @data
  */  
  fancy: false,
}).views(self => ({
  /**
   * Note: method is virtual and implemented by derived component
   * @public
   * @memberof module:components.InputInterfaceModel#
   * @type {string|json|number}
   * @getter
  */
  get inputValue () {
    throw new Error('Not implemented: inputValue', self.toJSON())
  },
})).actions(self => ({
  /**
   * Set or reset value if called without argument.
   * Note: method is virtual and implemented by derived component
   * @public
   * @memberof module:components.InputInterfaceModel#
   * @param {string|json|number} value
   * @action
  */
  setInputValue (value) {
    throw new Error('Not implemented: setInputValue', self.toJSON())
  },
  /**
   * @public
   * @memberof module:components.InputInterfaceModel#
   * @action
  */
  copyToClipboard () {
    self.element.select()
    document.execCommand('copy')
    self.element.setSelectionRange(0, 0)
  },
}))
