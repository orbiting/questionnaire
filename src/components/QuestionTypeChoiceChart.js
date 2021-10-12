import React, { Component } from 'react'
import { fontFamilies, colors, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import CheckCircle from 'react-icons/lib/md/check-circle'

import { withTranslations } from '../lib/TranslationsContext'

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
            {...styles.bar}
            {...colorScheme.set('backgroundColor', 'sequential60')}
            {...colorScheme.set('color', truePercent < 25 ? 'text' : 'default')}
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
                right: truePercent < 25 ? '100%' : 0,
                position: truePercent < 25 && 'relative',
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
              falsePercent < 25 ? 'text' : 'default'
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
                left: falsePercent < 25 ? '100%' : 0,
                position: falsePercent < 25 && 'relative',
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
