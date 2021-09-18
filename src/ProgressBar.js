import styled, { css } from 'styled-components'
import React from 'react'
import {
  plugin,
  createModel,
  cssInject,
  Plugins,
} from '@hoc/plugins-core'

import { PercentageProgressModel } from './models/percentageProgress'

const FlexCenter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const SProgress = styled(FlexCenter)`
  position: relative;
`

const PercentageBar = styled.div`
  display: flex;
  color: #637280;
  align-items: center;
  font-family: Montserrat, sans-serif;
  font-style: normal;
  font-weight: 300;
  font-size: 16px;
  line-height: 20px;
`

const SProgressBar = styled(FlexCenter)`
  position: absolute;
  width: inherit;
  height: inherit;
`

const SProgressBarRotated = styled(SProgressBar)`
  transform: rotate(-90deg);
`

export const ProgressBar = plugin('ProgressBar', PercentageProgressModel, {
}).component(props => {
  const { data } = props
  const { progress } = data

  const progressColor = '#FFBF00'
  const bgColor = '#ffffff'
  const maxSize = 64
  const strokeWidth = 3
  const center = maxSize / 2
  const innerRad = maxSize / 2 - strokeWidth
  const rad = maxSize / 2 - strokeWidth / 2
  const barLen = 2 * Math.PI * rad

  const style = {
    width: maxSize,
    height: maxSize,
  }

  return (
    <SProgress style={style} {...props}>
      <SProgressBarRotated>
        <svg viewBox={`0 0 ${maxSize} ${maxSize}`}>
          <circle cx={center} cy={center} r={innerRad} fill={bgColor} fillOpacity={0.5} />
          <circle cx={center} cy={center} r={rad} fill='none'
            stroke={progressColor} strokeWidth={strokeWidth}
            strokeDasharray={barLen}
            strokeDashoffset={barLen - (barLen / 100) * progress} />
        </svg>
      </SProgressBarRotated>
      <SProgressBar>
        <PercentageBar>{progress}%</PercentageBar>
      </SProgressBar>
    </SProgress>
  )
}).constructor((model, props) => {
  const { progress, ...restProps } = props
  return createModel(model, {
    type: 'ProgressBar',
    progress: progress || 0,
    ...restProps,
  })
}).events({
  DemoIncrement: ({ self }) => {
    self.setProgress(self.progress + 1)
  },
}).demo(true, () => Plugins.get('List').create({
  innerCss: cssInject(css`display: flex;`),
  items: [
    ProgressBar.create({
      progress: 0,
      events: { onClick: 'ProgressBar.DemoIncrement' },
    }),
    ProgressBar.create({
      progress: 99,
      events: { onClick: 'ProgressBar.DemoIncrement' },
    }),
  ],
}))

export default ProgressBar
