import { types } from 'mobx-state-tree'

export const Positions = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right',
  'drop-down',
]
export const RelativePos = types.enumeration('RelativePos', Positions)

export const RectModel = types.model('RectModel', {
  x: types.optional(types.number, 0),
  y: types.optional(types.number, 0),
  width: types.optional(types.number, 0),
  height: types.optional(types.number, 0),
  top: types.optional(types.number, 0),
  right: types.optional(types.number, 0),
  bottom: types.optional(types.number, 0),
  left: types.optional(types.number, 0),
}).actions(self => ({
  setRect (rect) {
    self.x = rect.x
    self.y = rect.y
    self.width = rect.width
    self.height = rect.height
    self.top = rect.top
    self.right = rect.right
    self.bottom = rect.bottom
    self.left = rect.left
  },
  setOffset (offset) {
    let [x, y] = offset
    if (x === undefined) x = 0
    if (y === undefined) y = 0
    self.x = self.x + x
    self.y = self.y + y
    self.top = self.y
    self.left = self.x
    self.right = self.x + self.width
    self.bottom = self.y + self.height
  },
})).views(self => ({
  get center () {
    return {
      x: self.x + self.width / 2,
      y: self.y + self.height / 2,
    }
  },
}))
