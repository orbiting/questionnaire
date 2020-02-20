import React, { Component } from 'react'
import { css } from 'glamor'
import uuid from '../lib/uuid'

import {
  Interaction,
  Button,
  fontStyles,
  fontFamilies,
  colors,
  mediaQueries
} from '@project-r/styleguide'
const { H2, H3, P } = Interaction
import withT from '../lib/withT'
import Chart from './Chart'

const styles = {
  container: css({
    paddingBottom: 30
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
      margin: '0px 10px'
    }
  }),
  buttons: css({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-evenly'
  }),
}



class ChoiceQuestion extends Component {
  constructor (props) {
    super(props)
    this.state = {
      answerId: (props.question.userAnswer && props.question.userAnswer.id) || uuid(),
    }
  }
  render () {

    this.handleChange = (value) => {
      const {
        onChange,
        questionnaire,
        question: {
          userAnswer,
          cardinality
        }
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
      questionnaire = {},
      question: {
        id,
        text,
        userAnswer,
        options,
        results
      }
    } = this.props
    const { question, colors } = this.props
    const { userHasSubmitted = false } = questionnaire

    return (
      <div {...styles.container}>
        <P {...styles.question}>{text}</P>
        <div {...styles.content}>
          { (userAnswer || userHasSubmitted) &&
            <div {...styles.mobileBorder}>
              <Chart question={question} colors={colors} />
            </div>
          }
          { (!userAnswer && !userHasSubmitted) &&
            <div {...styles.buttons}>
              { options.map(option =>
                <div key={`${id}-${option.value}`}>
                  <Button onClick={() => this.handleChange(option.value)} >
                    {option.label}
                  </Button>
                </div>
              )}
            </div>
          }
        </div>
      </div>
    )
  }
}

export default withT(ChoiceQuestion)
