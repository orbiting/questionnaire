import React, { Component } from 'react'
import { css } from 'glamor'
import uuid from '../lib/uuid'

import { Interaction, Button, mediaQueries, Label } from '@project-r/styleguide'
const { P } = Interaction

import { withTranslations } from '../lib/TranslationsContext'

import Chart from './QuestionTypeChoiceChart'

const styles = {
  container: css({
    margin: '50px 0 10px 0',
  }),
  question: css({
    margin: '0px 0 20px 0',
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
      questionnaire,
      question: { id, text, userAnswer, options, choiceResults: results },
      showResults,
    } = this.props
    const { question } = this.props
    const { userHasSubmitted } = questionnaire

    // if question text contains additional text, the text is separeted by %% signs, it is assumed that the first part of the text is the question
    const questionTexts = text.split('%%')

    const hasAdditionalText = questionTexts.length > 1

    return (
      <div {...styles.container}>
        <div {...styles.question}>
          <P>{questionTexts[0]}</P>
          <></>
          {hasAdditionalText &&
            questionTexts.map((additionalText, idx) => {
              if (idx > 0) {
                return (
                  <P>
                    <small>{additionalText}</small>
                  </P>
                )
              }
            })}
        </div>
        <div {...styles.content}>
          {(userAnswer || userHasSubmitted || showResults) && (
            <div {...styles.mobileBorder}>
              <Chart question={question} options={options} />
            </div>
          )}
          {!userAnswer && !userHasSubmitted && !showResults && (
            <div {...styles.buttons}>
              {options.map((option) => (
                <div key={`${id}-${option.value}`}>
                  <Button onClick={() => this.handleChange(option.value)}>
                    {option.label}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default withTranslations(QuestionTypeChoice)
