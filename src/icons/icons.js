import React from 'react'

import { ReactComponent as _CheckMarkIcon } from './svg/checkmark.svg'
import { ReactComponent as _BlankIcon } from './svg/blank.svg'
import { ReactComponent as _ArrDownIcon } from './svg/downArrow.svg'
import { ReactComponent as _xIcon } from './svg/x.svg'
import { ReactComponent as _ThreeDotsIcon } from './svg/vert3dots.svg'


function SvgExport (SvgComponent) {
  // eslint-disable-next-line react/display-name
  return props => <SvgComponent {...props} />
}

export const BlankIcon = SvgExport(_BlankIcon)
export const CheckMarkIcon = SvgExport(_CheckMarkIcon)
export const ArrDownIcon = SvgExport(_ArrDownIcon)
export const xIcon = SvgExport(_xIcon)
export const ThreeDotsIcon = SvgExport(_ThreeDotsIcon)

export const icons = {
  checkmark: CheckMarkIcon,
  diagarrow: DiagArrowIcon,
  blank: BlankIcon,
  smallcross: xIcon,
  dots: ThreeDotsIcon,
}

export function setIcons (externalIcons) {
  Object.assign(icons, externalIcons)
}

export default icons
