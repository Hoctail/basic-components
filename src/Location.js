import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { plugin } from '@hoc/plugins-core'

/**
 * @classdesc
 * Extends {@link module:components.EventsModel EventsModel}.
 * Getting URL changes updates, should be rendered.
 * ### Typical usage by another plugin
 * ``` js
 * import { plugin, plugins } from '@hoc/plugins-core'
 * const { Location } = plugins
 * const MyPlugin = plugin('MyPlugin', {
 *  // snapshot node will be rendered by convention
 *  snapshot: typePlugin(Location, () => Location.create()),
 * }).reactions(self => [
 *  [
 *    () => self.loc.pathname,
 *    pathName => self.reactOnUrlChange(),
 *    'pathname', // debug info
 *  ],
 * ]).views(self => ({
 *  get loc () {
 *    return self.snapshot
 *  },
 * })).actions(self => ({
 *  reactOnUrlChange () {
 *    const { hash, pathname } = self.loc
 *    console.log(pathname, hash)
 *  },
 * }))
 * ```
 * @public
 * @class module:components.Location
 * @static
 * @hideconstructor
*/
export const Location = plugin('Location', {
  /**
   * set if client route have prefix like '/username/appname'
   * @public
   * @memberof module:components.Location#
   * @type {string}
   * @default ''
   * @data
  */  
  prefix: '/',
  /**
   * When location has changed it will be updated automatically.
   * Corresponding to client route - part of url going after app name, e.g.:
   * demo.hoctail.io/username/appname/{pathname}
   * @public
   * @memberof module:components.Location#
   * @type {string}
   * @default ''
   * @data
  */
  pathname: '',
  /**
   * When location has changed it will be updated automatically.
   * URL #hash, like: demo.hoctail.io/username/appname/#hashval
   * @public
   * @memberof module:components.Location#
   * @type {string}
   * @default ''
   * @data
  */
  hash: '',
}).actions(self => ({
  afterCreate () {
    // setup initial pathname
    const { pathname, hash } = window.document.location
    self.hash = hash
    if (pathname.startsWith(self.prefix)) {
      self.pathname = pathname.substring(self.prefix.length)
    }
  },
  setLocation (loc) {locationChanged
    self.pathname = loc.pathname
    self.hash = loc.hash
  },
})).component(withRouter(class Location extends React.Component {
  static propTypes = {
    data: PropTypes.any,
    match: PropTypes.any,
    location: PropTypes.any,
  }

  async locationChanged () {
    const { location : loc, data } = this.props
    if (loc.pathname !== data.pathname || loc.hash !== data.hash) {
      Location._handlers.SetLocation({ data, location })
    }
  }

  render () {
    window.requestAnimationFrame(() => {
      this.locationChanged()
    })
    return null
  }
})).events({
  SetLocation ({ data, location }) {
    data.setLocation(location)
  },
})

export default Location
