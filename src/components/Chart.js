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
import CheckCircle from 'react-icons/lib/md/check-circle'

const HEIGHT = 64
const BAR_HEIGHT = 32
const CIRCLE_SIZE = 22

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
    whiteSpace: 'nowrap',
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
    marginBottom: 1
  }),
  userAnswerIcon: css({
    marginBottom: 4
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
    const userAnswerFalse = userAnswer && userAnswer.payload.value[0] == 'false'

    const getPercentage = (result) =>
      submitted > 0
      ? Math.round(100/submitted*result.count)
      : 0

    const truePercent = getPercentage(trueResult)
    const falsePercent = getPercentage(falseResult)

    return (
      <div style={{ width: '100%' }}>
        <div {...styles.labels} style={{ justifyContent: 'space-around' }}>
          <label>{submitted} Stimmen</label>
        </div>
        <div {...styles.bars}>
          <div {...styles.left}>
            <div {...styles.bar} style={{
              right: 0,
              width: `${truePercent}%`,
              backgroundColor: 'rgb(75,151,201)',
              direction: 'rtl',
              textAlign: 'left',
            }}>
              <span style={{ marginLeft: userAnswerTrue ? -CIRCLE_SIZE : 0 }}>
                <label {...styles.barLabel}>Ja {truePercent}%</label>
                { userAnswerTrue &&
                  <CheckCircle {...styles.userAnswerIcon} size={CIRCLE_SIZE} color={colors.primary} />
                }
              </span>
            </div>
          </div>
          <div {...styles.right}>
            <div {...styles.bar} style={{
              left: 0,
              width: `${falsePercent}%`,
              backgroundColor: '#ff7f0e',
              textAlign: 'right',
            }}>
              <span style={{ marginRight: userAnswerFalse ? -CIRCLE_SIZE : 0 }}>
                <label {...styles.barLabel}>Nein {falsePercent}%</label>
                { userAnswerFalse &&
                  <CheckCircle {...styles.userAnswerIcon} size={CIRCLE_SIZE} color={colors.primary} />
                }
              </span>
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
