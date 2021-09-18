import React from 'react'
import styled, { css } from 'styled-components'
import { types } from 'mobx-state-tree'
import PropTypes from 'prop-types'
import {
  metaElement,
  dynamicModelsTypes,
  plugin,
  typePlugin,
} from '@hoc/plugins-core'

import { RectModel, RelativePos } from './models/rect'

// Automatically fix relative rect if its size < value below.
// currently it's critical to fix width only, so h is remains unfixed
const KRelativeMinSize = { w: 32, h: 0 }

const isDOM = el => el instanceof Element

const TooltipArrowSize = '0.5rem'

const boxBR = css`
  left: 0;
  top: calc(100% + ${TooltipArrowSize} - 2px);
`

const boxBC = css`
  left: 50%;
  transform: translate(-50%);
  top: calc(100% + ${TooltipArrowSize} - 2px);
`

const boxBL = css`
  right: 0;
  top: calc(100% + ${TooltipArrowSize} - 2px);
`

const boxTR = css`
  left: 0;
  top: calc(${TooltipArrowSize} * -1 + 2px);
  transform: translate(0, -100%);
`

const boxTC = css`
  left: 50%;
  transform: translate(-50%, -100%);
  top: calc(${TooltipArrowSize} * -1 + 2px);
`

const boxTL = css`
  right: 0;
  top: calc(${TooltipArrowSize} * -1 + 2px);
  transform: translate(0, -100%);
`

const boxR = css`
  right: calc(${TooltipArrowSize} * -1 + 2px);
  top: 50%;
  transform: translate(100%, -50%);
`

const boxL = css`
  left: calc(${TooltipArrowSize} * -1 + 2px);
  top: 50%;
  transform: translate(-100%, -50%);
`

const boxDD = css`
  left: 0;
  top: 0;
  right: 0;
`

const boxC = css`
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const TooltipWrapper = styled.div`
  ${props => {
    switch (props.pos) {
      case 'bottom-left':
        return boxBL
      case 'bottom':
        return boxBC
      case 'bottom-right':
        return boxBR
      case 'top-left':
        return boxTL
      case 'top':
        return boxTC
      case 'top-right':
        return boxTR
      case 'right':
        return boxR
      case 'left':
        return boxL
      case 'drop-down':
        return boxDD
      case 'center':
        return boxC
      default:
        return boxBL
    }
  }};
  position: absolute;
  background: #fff;
  border-color: #fff;
  z-index: 99;
  border-radius: 5px;
`

const SRelative = styled.div.attrs(props => ({
  style: {
    top: `${props.parentTop}px`,
    left: `${props.parentLeft}px`,
  },
}))`
  position: fixed;
  visibility: ${props => props.visibility};
  width: ${props => props.rect.width}px;
  height: ${props => props.rect.height}px;
`

export const Relative = plugin('Relative', {
  content: types.maybeNull(
    typePlugin(() => dynamicModelsTypes()),
  ),
  parentRect: types.optional(RectModel, {}),
  // if set then content will be relative to parentRect
  relativePos: types.maybeNull(RelativePos),
  childHasMaxWidth: false, // use max-width for child
}).views(self => ({
  // add getters to be able redraw item on scroll
  get parentTop () {
    return self.parentRect.top
  },
  get parentLeft () {
    return self.parentRect.left
  },
})).actions(self => ({
  setRelativePos (relativePos) {
    if (relativePos) {
      self.relativePos = relativePos
    } else {
      self.relativePos = null
    }
  },
  setContent (content) {
    self.portal.content.setContent(content)
  },
  setChildHasMaxWidth (hasMaxWidth) {
    self.childHasMaxWidth = hasMaxWidth
  },
  setOffset (offset) {
    self.parentRect.setOffset(offset)
  },
})).actions(self => {
  let _parent = null
  const _scrollableAreaElements = new Set()
  function _scrollListener (e) {
    window.requestAnimationFrame(() => {
      // non persistent data can be mutated outside of tx
      self._setParentRect(_parent.getBoundingClientRect())
    })
  }
  function _removeListener (scrollableArea) {
    if (scrollableArea == null) {
      _scrollableAreaElements.forEach((el) => {
        el.removeEventListener(
          'scroll', _scrollListener,
        )
      })
      _scrollableAreaElements.clear()
    } else {
      if (_scrollableAreaElements.has(scrollableArea)) {
        scrollableArea.removeEventListener(
          'scroll', _scrollListener,
        )
        _scrollableAreaElements.delete(scrollableArea)
      }
    }
  }
  function _addListener (scrollableArea) {
    _removeListener(scrollableArea)
    _scrollableAreaElements.add(scrollableArea)
    scrollableArea.addEventListener('scroll', _scrollListener)
    self.onDestroy(() => _removeListener(scrollableArea))
  }
  function setParent (parent) {
    _parent = isDOM(parent) ? parent : parent.element
    self._setParentRect(_parent.getBoundingClientRect())
  }
  function startObservingScrollElement (scrollableAreaElement = window) {
    /** sets parent
     * @scrollableArea start scroll listeners for scrollableArea element
     * if any, window is by default
     */
    _addListener(scrollableAreaElement)
  }

  return { setParent, startObservingScrollElement }
}).actions(self => ({
  _setParentRect (clientRect) {
    // grow parent rect to min dimensions if needed
    // TODO: Check if we can nor remove following rect fix
    let { height: h, width: w, x, y } = clientRect
    if (w < KRelativeMinSize.w) {
      x = x - KRelativeMinSize.w / 2 + w / 2
      w = KRelativeMinSize.w
    }
    if (h < KRelativeMinSize.h) {
      y = y - KRelativeMinSize.h / 2 + h / 2
      h = KRelativeMinSize.h
    }
    self.parentRect.setRect(new DOMRect(x, y, w, h))
  },
})).component(class Relative extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const {
      parentRect,
      parentTop,
      parentLeft,
      relativePos,
      content,
      childHasMaxWidth,
    } = data

    return (
      <SRelative
        parentTop={parentTop} parentLeft={parentLeft} rect={parentRect}
        visibility={relativePos ? 'hidden' : 'visible'} {...restProps}
      >
        {relativePos ? (
          <TooltipWrapper pos={relativePos} style={{
            width: childHasMaxWidth ? '100%' : 'none',
            background: 'none',
            visibility: 'visible',
          }}
          >
            {metaElement(content)}
          </TooltipWrapper>
        ) : metaElement(content)}
      </SRelative>
    )
  }
})

export default Relative
