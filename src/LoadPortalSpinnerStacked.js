import React from 'react'
import PropTypes from 'prop-types'
import { types } from 'mobx-state-tree'
import {
  plugin,
  metaElement,
  typePlugin,
} from '@hoc/plugins-core'

import { LoadPortalSpinner } from './LoadPortalSpinner'

export const LoadPortalSpinnerStacked = plugin('LoadPortalSpinnerStacked', {
  portalSpinner: typePlugin(LoadPortalSpinner, p => p.create()),
  whois: types.maybeNull(types.string),
  stacked: types.array(types.model('StackedPortalData', {
    whois: types.string, // must have stacked this value when stacked
    type: types.maybeNull(types.string),
    path: types.maybeNull(types.string),
  })),
}).views(self => ({
  get loading () {
    return self.portalSpinner.loading
  },
})).actions(self => ({
  resetAndHide () {
    self.stacked = []
    self.setLoading(false)
  },
  setLoading (loading, parent, whois) {
    // const arr = self.stacked
    // const lastStacked = arr.length > 0 ? arr[arr.length - 1] : {}
    const stackedIdx = self.stacked.findIndex(({ whois: _whois }) => _whois === whois)

    // console.log('setLoading', loading, whois, stackedIdx)
    if (loading) {
      // stack existing spinner, if not stacked yet
      if (self.loading && stackedIdx === -1) {
        self.stacked.push({
          whois: self.whois,
          type: self.portalSpinner.contentPathType,
          path: self.portalSpinner.contentPath,
        })
      }
      self.whois = whois
      self.portalSpinner.setLoading(loading, parent)
    } else {
      if (self.stacked.length) {
        if (self.whois === whois) {
          // cast to json as workaround as of warning:
          // You are trying to read or write to an object that is no longer part of a state tree
          const { type, path } = self.stacked.pop().toJSON()
          self.portalSpinner.setContentManually(type, path)
        } else if (stackedIdx !== -1) {
          // just remove stacked spinner not affecting the current one
          self.stacked.splice(stackedIdx, 1)
        }
      } else {
        self.portalSpinner.setLoading(false)
      }
    }
  },
})).component(class LoadPortalSpinnerStacked extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    return metaElement(this.props.data.portalSpinner)
  }
})

export default LoadPortalSpinnerStacked
