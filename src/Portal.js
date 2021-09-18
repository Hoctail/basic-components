import React from 'react'
import ReactDOM from 'react-dom'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import {
  dynamicModelsTypes,
  metaElement,
  plugin,
  typePlugin,
} from '@hoc/plugins-core'

const KDoNotPropagateEvents = [
  'onClick', 'onContextMenu', 'onDoubleClick', 'onDrag', 'onDragEnd',
  'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver',
  'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter',
  'onMouseLeave', 'onMouseMove', 'onMouseOver', 'onMouseOut',
  'onMouseUp', 'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus',
  'onBlur', 'onChange', 'onInput', 'onInvalid', 'onSubmit',
]

export const Portal = plugin('Portal', {
  portalid: 'default_portal',
  content: types.maybeNull(typePlugin(() => dynamicModelsTypes())),
  /** use empty array '[]' to propagate events outside of portal */
  doNotPropagateEvents: types.optional(
    types.array(types.string), KDoNotPropagateEvents,
  ),
})
// disable reaction for better performance
// .reactionsA(self => [
//   [
//     () => self.doNotPropagateEvents.length,
//     () => self.setDoNotPropagateEvents(self.doNotPropagateEvents),
//     'setDoNotPropagateEvents',
//   ],
// ])
.views(self => ({
  // add getters to be able redraw item on scroll
  get parentTop () {
    return self.parentRect.top
  },
  get parentLeft () {
    return self.parentRect.left
  },
})).actions(self => ({
  afterCreate () {
    self.setDoNotPropagateEvents(self.doNotPropagateEvents)
  },
  setDoNotPropagateEvents (eventsNames = KDoNotPropagateEvents) {
    self.doNotPropagateEvents = eventsNames
    const events = {}
    self.doNotPropagateEvents.forEach(eventName => {
      events[eventName] = 'Portal.StopEvent'
    })
    self.setEvents(events)
  },
  setContent (content) {
    self.content = content
  },
  setPortalId (portalid) {
    self.portalid = portalid
  },
})).eventsNoTx({
  StopEvent: ({ event, eventName }) => {
    event.stopPropagation()
  },
}).component(class Portal extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { content, portalid } = data
    return ReactDOM.createPortal(
      (
        <div {...restProps}>
          {metaElement(content)}
        </div>
      ),
      document.getElementById(portalid),
    )
  }
})

export default Portal
