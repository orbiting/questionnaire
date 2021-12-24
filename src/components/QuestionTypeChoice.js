import React, { Component } from 'react'
import { css } from 'glamor'
import uuid from '../lib/uuid'

import { Interaction, Button, mediaQueries } from '@project-r/styleguide'
const { P } = Interaction

import { withTranslations } from '../lib/TranslationsContext'

import Chart from './QuestionTypeChoiceChart'
import MessageBox from './MessageBox'

const styles = {
  container: css({
    margin: '50px 0 10px 0',
  }),
  question: css({
    margin: '0px 0 10px 0',
  }),
  content: css({
    height: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  mobileBorder: css({
    [mediaQueries.onlyS]: {
      margin: '0px 10px',
    },
  }),
  mobileBox: css({
    [mediaQueries.onlyS]: {
      margin: '20px 0',
    },
  }),
  buttons: css({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-evenly',
  }),
}

class QuestionTypeChoice extends Component {
  constructor(props) {
    super(props)
    this.state = {
      answerId:
        (props.question.userAnswer && props.question.userAnswer.id) || uuid(),
    }
  }
  render() {
    this.handleChange = (value) => {
      const {
        onChange,
        questionnaire,
        question: { userAnswer, cardinality },
      } = this.props
      const nextValue = new Set(userAnswer ? userAnswer.payload.value : [])

      if (cardinality === 0 || cardinality > 1) {
        if (nextValue.has(value)) {
          nextValue.delete(value)
        } else {
          nextValue.add(value)
        }
      } else {
        nextValue.clear()
        nextValue.add(value)
      }

      const { answerId } = this.state

      onChange(answerId, Array.from(nextValue))
    }

    const {
      t,
      questionnaire,
      question: { id, text, userAnswer, options, choiceResults: results },
      showResults,
      hideAnswers,
    } = this.props
    const { question } = this.props
    const { userHasSubmitted } = questionnaire

    return (
      <div {...styles.container}>
        <P {...styles.question}>{text}</P>
        {hideAnswers && (userAnswer || userHasSubmitted || showResults) && (
          <div {...styles.message}>
            <div {...styles.mobileBox}>
              <MessageBox>{t('questionnaire/hideAnswers/thankyou')}</MessageBox>
            </div>
          </div>
        )}
        {!hideAnswers && (userAnswer || userHasSubmitted || showResults) && (
          <div {...styles.content}>
            <div {...styles.mobileBorder}>
              <Chart question={question} />
            </div>
          </div>
        )}
        {!userAnswer && !userHasSubmitted && !showResults && (
          <div {...styles.content}>
            <div {...styles.buttons}>
              {options.map((option) => (
                <div key={`${id}-${option.value}`}>
                  <Button onClick={() => this.handleChange(option.value)}>
                    {option.label}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default withTranslations(QuestionTypeChoice)
