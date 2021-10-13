import React, { Component } from 'react'
import memoize from 'lodash/memoize'
import { fontFamilies, colors, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import CheckCircle from 'react-icons/lib/md/check-circle'

import { withTranslations } from '../lib/TranslationsContext'

const measurementDiv = memoize(
  () => {
    const div = document.createElement('div')
    div.className = 'DOMMEASUREMENTOUTLET'
    div.style.position = 'fixed'
    div.style.top = '-100%'
    div.style.visibility = 'hidden'
    div.style.pointerEvents = 'none'
    document.body.appendChild(div)
    return div
  },
  () => ''
)

const createTextGauger = memoize(
  ({ fontFamily, fontSize, lineHeight }, { dimension, html }) => {
    if (typeof document === 'undefined') {
      return (text) => {
        // SSR approximation
        return fontSize * 0.6 * text.length
      }
    }
    const element = document.createElement('span')
    element.style.fontFamily = fontFamily
    element.style.fontSize = `${fontSize}px`
    element.style.lineHeight = lineHeight
    measurementDiv().appendChild(element)
    if (html) {
      return memoize((text) => {
        element.innerHTML = text
        return element.getBoundingClientRect()[dimension]
      })
    }
    return memoize((text) => {
      element.textContent = text
      return element.getBoundingClientRect()[dimension]
    })
  },
  ({ fontFamily, fontSize, lineHeight }, { dimension, html }) =>
    [fontFamily, fontSize, lineHeight, dimension, html].join()
)

const HEIGHT = 64
const BAR_HEIGHT = 32
const CIRCLE_SIZE = 22

const styles = {
  bars: css({
    display: 'flex',
    width: '100%',
    height: HEIGHT,
  }),
  barTick: css({
    position: 'relative',
    height: HEIGHT,
    width: '1px',
  }),
  left: css({
    width: '50%',
    position: 'relative',
  }),
  right: css({
    width: '50%',
    position: 'relative',
  }),
  bar: css({
    position: 'absolute',
    top: (HEIGHT - BAR_HEIGHT) / 2,
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
    color: '#979797',
  }),
  label: css({
    whiteSpace: 'nowrap',
    marginBottom: 1,
  }),
  userAnswerIcon: css({
    marginBottom: 4,
  }),
}

const labelGauger = createTextGauger(
  { fontFamily: fontFamilies.sansSerifRegular, fontSize: '16px' },
  {
    dimension: 'width',
    html: true,
  }
)

const QuestionTypeChoiceChart = (props) => {
  const [colorScheme] = useColorContext()
  const { question, t } = props
  if (!question || !question.choiceResults) {
    return null
  }

  const {
    turnout: { submitted },
    choiceResults: results,
    userAnswer,
  } = question
  const trueResult = results.find((r) => r.option.value == 'true')
  const falseResult = results.find((r) => r.option.value == 'false')
  const userAnswerTrue = userAnswer && userAnswer.payload.value[0] == 'true'
  const userAnswerFalse = userAnswer && userAnswer.payload.value[0] == 'false'

  const getPercentage = (result) =>
    submitted > 0 ? Math.round((100 / submitted) * result.count) : 0

  const truePercent = getPercentage(trueResult)
  const falsePercent = getPercentage(falseResult)

  const truePercentWidth = ((window.innerWidth - 50) * truePercent) / 100 / 2
  const moveTruePercentLabel =
    labelGauger('Ja ' + truePercent + '%') + 2 > truePercentWidth

  const falsePercentWidth = ((window.innerWidth - 50) * falsePercent) / 100 / 2
  const moveFalsePercentLabel =
    labelGauger('Nein ' + falsePercent + '%') + 2 > falsePercentWidth

  return (
    <div style={{ width: '100%' }}>
      <div {...styles.labels} style={{ justifyContent: 'space-around' }}>
        <label>
          {t.pluralize('questionnaire/question/choice/votes', {
            count: submitted,
          })}
        </label>
      </div>
      <div {...styles.bars}>
        <div
          {...styles.barTick}
          {...colorScheme.set('backgroundColor', 'divider')}
        ></div>
        <div {...styles.left}>
          <div
            id='true-percent-wrapper'
            {...styles.bar}
            {...colorScheme.set('backgroundColor', 'sequential60')}
            {...colorScheme.set(
              'color',
              moveTruePercentLabel ? 'text' : 'default'
            )}
            style={{
              right: 0,
              width: `${truePercent}%`,
              direction: 'rtl',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                marginLeft: userAnswerTrue ? -CIRCLE_SIZE : 0,
                right: moveTruePercentLabel ? '100%' : 0,
                position: moveTruePercentLabel && 'relative',
              }}
            >
              <label {...styles.barLabel}>
                {t('questionnaire/question/choice/true', {
                  value: truePercent,
                })}
              </label>
              {userAnswerTrue && (
                <CheckCircle
                  {...styles.userAnswerIcon}
                  {...colorScheme.set('color', 'primary')}
                  size={CIRCLE_SIZE}
                />
              )}
            </span>
          </div>
        </div>
        <div
          {...styles.barTick}
          {...colorScheme.set('backgroundColor', 'divider')}
        ></div>
        <div {...styles.right}>
          <div
            {...styles.bar}
            {...colorScheme.set('backgroundColor', 'opposite60')}
            {...colorScheme.set(
              'color',
              moveFalsePercentLabel ? 'text' : 'default'
            )}
            style={{
              left: 0,
              width: `${falsePercent}%`,
              textAlign: 'right',
            }}
          >
            <span
              style={{
                marginRight: userAnswerFalse ? -CIRCLE_SIZE : 0,
                left: moveFalsePercentLabel ? '100%' : 0,
                position: moveFalsePercentLabel && 'relative',
              }}
            >
              <label {...styles.barLabel}>
                {t('questionnaire/question/choice/false', {
                  value: falsePercent,
                })}
              </label>
              {userAnswerFalse && (
                <CheckCircle
                  {...styles.userAnswerIcon}
                  {...colorScheme.set('color', 'primary')}
                  size={CIRCLE_SIZE}
                />
              )}
            </span>
          </div>
        </div>
        <div
          {...styles.barTick}
          {...colorScheme.set('backgroundColor', 'divider')}
        ></div>
      </div>
      <div {...styles.labels}>
        <label {...styles.label}>100%</label>
        <label {...styles.label}>0%</label>
        <label {...styles.label}>100%</label>
      </div>
    </div>
  )
}

export default withTranslations(QuestionTypeChoiceChart)
