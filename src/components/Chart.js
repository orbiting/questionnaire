import React, { Component } from 'react'
import {
  Interaction,
  Button,
  fontStyles,
  fontFamilies,
  colors
} from '@project-r/styleguide'
const { H2, H3, P } = Interaction
import { css } from 'glamor'

const HEIGHT = 64
const BAR_HEIGHT = 32

const styles = {
  bars: css({
    display: 'flex',
    width: '100%',
    height: HEIGHT
  }),
  left: css({
    width: '50%',
    borderLeftColor: 'rgba(0,0,0,0.17)',
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderRightColor: 'rgba(0,0,0,0.17)',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    position: 'relative'
  }),
  right: css({
    width: '50%',
    borderRightColor: 'rgba(0,0,0,0.17)',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    position: 'relative'
  }),
  bar: css({
    position: 'absolute',
    top: (HEIGHT-BAR_HEIGHT)/2,
    height: BAR_HEIGHT,
  }),
  barLabel: css({
    fontFamily: fontFamilies.sansSerifRegular,
    height: BAR_HEIGHT,
    lineHeight: `${BAR_HEIGHT}px`,
    whiteSpace: 'nowrap',
    padding: '0px 4px',
  }),
  labels: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: fontFamilies.sansSerifRegular,
    fontWeight: 'normal',
    fontSize: 12,
    color: '#979797'
  }),
  label: css({
    whiteSpace: 'nowrap',
  })
}

class Chart extends Component {
  render () {
    const { question } = this.props
    if (!question || !question.results) {
      return
    }
    const { turnout: { submitted }, results, userAnswer } = question
    const trueResult = results.find( r => r.option.value == 'true')
    const falseResult = results.find( r => r.option.value == 'false')
    const userAnswerTrue = userAnswer && userAnswer.payload.value[0] == 'true'

    const getPercentage = (result) =>
      Math.round(100/submitted*result.count)

    const truePercent = getPercentage(trueResult)
    const falsePercent = getPercentage(falseResult)

    return (
      <div style={{ width: '100%' }}>
        <div {...styles.bars}>
          <div {...styles.left}>
            <div {...styles.bar} style={{
              right: 0,
              width: `${truePercent}%`,
              backgroundColor: '#2ca02c',
              direction: 'rtl',
              textAlign: 'left',
              fontWeight: (userAnswer && userAnswerTrue) ? 'bold' : 'normal',
            }}>
              <label {...styles.barLabel}>Ja {truePercent}%</label>
            </div>
          </div>
          <div {...styles.right}>
            <div {...styles.bar} style={{
              left: 0,
              width: `${falsePercent}%`,
              backgroundColor: '#d62728',
              textAlign: 'right',
              fontWeight: (userAnswer && !userAnswerTrue) ? 'bold' : 'normal',
            }}>
              <label {...styles.barLabel}>Nein {falsePercent}%</label>
            </div>
          </div>
        </div>
        <div {...styles.labels}>
          <label {...styles.label}>100%</label>
          <label {...styles.label}>0%</label>
          <label {...styles.label}>100%</label>
        </div>
      </div>
    )
  }
}

export default Chart
