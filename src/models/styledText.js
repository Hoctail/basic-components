import { types } from 'mobx-state-tree'

/**
 * @classdesc
 * Inheritance interface model for text components, gives some font styling features
 * like size, style, weight and displaying options like bgcolor, color.
 * @public
 * @class module:components.StyledTextModel
 * @static
 * @hideconstructor
*/
export const StyledTextModel = types.model('StyledTextModel', {
  /**
   * @public
   * @memberof module:components.StyledTextModel#
   * @type {'tiny'|'small'|'normal'|'big'|'huge'}
   * @default 'normal'
   * @data
  */
  size: types.optional(types.enumeration('Size',
    ['tiny', 'small', 'normal', 'big', 'huge']), 'normal'),
  /**
   * font styling
   * @public
   * @memberof module:components.StyledTextModel#
   * @type {'normal'|'italic'}
   * @default 'normal'
   * @data
  */
  style: types.optional(types.enumeration('Style',
    ['normal', 'italic']), 'normal'),
  /**
   * font styling
   * @public
   * @memberof module:components.StyledTextModel#
   * @type {'normal'|'bold'}
   * @default 'normal'
   * @data
  */
  weight: types.optional(types.union(
    types.enumeration('Weight', ['normal', 'bold']),
    types.integer,
  ), 'normal'),
  /**
   * @public
   * @memberof module:components.StyledTextModel#
   * @type {string}
   * @default ''
   * @data
  */
  bgcolor: '',
  /**
   * @public
   * @memberof module:components.StyledTextModel#
   * @type {string}
   * @default ''
   * @data
  */
  color: '',
}).actions(self => ({
  /**
   * @public
   * @memberof module:components.StyledTextModel#
   * @param {'normal'|'bold'} weight
   * @action
  */
  setWeight (weight) {
    self.weight = weight
  },
  /**
   * Wrapper around {@link module:components.StyledTextModel#setWeight setWeight}
   * @public
   * @memberof module:components.StyledTextModel#
   * @param {'normal'|'bold'} weight
   * @action
  */
  setBold (bold = true) {
    if (bold) self.setWeight('bold')
    else self.setWeight('normal')
  },
  /**
   * Set background color
   * @public
   * @memberof module:components.StyledTextModel#
   * @param {string} bgcolor
   * @action
  */
  setBgcolor (bgcolor) {
    self.bgcolor = bgcolor
  },
  /**
   * Set text color
   * @public
   * @memberof module:components.StyledTextModel#
   * @param {string} color
   * @action
  */
  setColor (color) {
    self.color = color
  },
})).views(self => ({
  get sizeStr () {
    switch (self.size) {
      case 'tiny':
        return `
          font-size: 0.6rem;
          line-height: 0.7rem;
        `
      case 'small':
        return `
          font-size: 0.75rem;
          line-height: 1rem;
        `
      case 'normal':
        return `
        `
      case 'big':
        return `
          font-size: 1.5rem;
          line-height: 2rem;
        `
      case 'huge':
        return `
          font-size: 2.5rem;
          line-height: 3.5rem;
        `
      default:
        return ''
    }
  },
  /**
   * Stringified css related to font styling, like
   * ``` css
   * font-size: 0.6rem;
   * line-height: 0.7rem;
   * font-style: italic;
   * font-weight: bold;
   * ```
   * @public
   * @memberof module:components.StyledTextModel#
   * @type {string}
   * @getter
  */
  get textCss () {
    return `
      font-style: ${self.style};
      font-weight: ${self.weight};
      ${self.sizeStr}
    `
  },
  /**
   * @public
   * @memberof module:components.StyledTextModel#
   * @type {boolean}
   * @getter
  */
  get isBold () {
    return self.weight === 'bold'
  },
}))
