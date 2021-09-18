import { types } from 'mobx-state-tree'

export const PercentageProgressModel = types.model('PercentageProgressModel', {
  progress: types.maybeNull(types.integer),
}).actions(self => ({
  setProgress (percentage) {
    if (percentage >= 0 && percentage <= 100) {
      self.progress = percentage
    }
  },
  reset () {
    self.setProgress(0)
  },
})).views(self => ({
  isCompleted () {
    return self.progress === 100
  },
}))
