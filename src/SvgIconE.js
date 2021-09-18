import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { getRoot } from 'mobx-state-tree'
import { plugin, cssInject, metaElement } from '@hoc/plugins-core'

import { SvgIcon } from './SvgIcon'
import { List } from './List'
import { TooltipMessage } from './TooltipMessage'

import { icons } from './icons/icons'

const SSvgIconE = styled.div`
  display: flex;
  align-items: center;
`

// eslint-disable-next-line react/display-name
const SvgIconEComponent = Comp => (props) => {
  // eslint-disable-next-line react/prop-types
  const { data, ...restProps } = props
  // eslint-disable-next-line react/prop-types
  const { appColors } = data
  return (
    <SSvgIconE {...restProps} >
      <Comp className='' data={data} appColors={appColors} />
    </SSvgIconE>
  )
}

export const SvgIconE = plugin('SvgIconE', SvgIcon.Model, {
}).component(
  SvgIconEComponent(SvgIcon.Component),
).demo(class SvgIconDemo extends React.Component {
  static propTypes = { data: PropTypes.object }

  constructor (props) {
    super(props)
    this.node = List.create({
      items: [
        TooltipMessage.create({
          relativePos: 'top-right',
        }),
        List.create({
          innerCss: cssInject(css`
            display: flex;
            flex-wrap: wrap;
          `),
          items: Object.keys(icons).map((name, keyIdx) => (
            SvgIconE.create({
              name: name,
              width: '32',
              height: '32',
              fill: 'gray',
              outerCss: cssInject(css`
                padding: 0.1rem
              `),
              events: {
                onMouseEnter: 'SvgIconE.MouseEnter',
                onMouseLeave: 'SvgIconE.MouseLeave',
              },
            })
          )),
        }),
      ],
    })
  }

  render () {
    return metaElement(this.node)
  }
}).events({
  MouseEnter: ({ data }) => {
    const list = getRoot(data)
    list.items[0].showMessage(data, data.name, { timeout: 3000 })
  },
  MouseLeave: ({ data }) => {
    const list = getRoot(data)
    list.items[0].hide()
  },
})

export default SvgIconE
