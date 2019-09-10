import React, { Component } from 'react'
import { css } from 'glamor'
import uuid from '../lib/uuid'

import {
  Interaction,
  Button,
  fontStyles,
  fontFamilies,
  colors
} from '@project-r/styleguide'
const { H2, H3, P } = Interaction
import withT from '../lib/withT'
import Chart from './Chart'

const styles = {
  container: css({
    margin: '50px 0 10px 0'
  }),
  question: css({
    margin: '0px 0 10px 0',
  }),
  content: css({
    width: '100%',
    height: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  buttons: css({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-evenly',
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
      const { onChange, questionnaire, question: { userAnswer, cardinality } } = this.props
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

    const { questionnaire, question: { id, text, userAnswer, options, results } } = this.props
    const { question } = this.props
	  const { userHasSubmitted } = questionnaire

    return (
      <div {...styles.container}>
        <H3 {...styles.question}>{text}</H3>
        <div {...styles.content}>
          { (userAnswer || userHasSubmitted) &&
            <Chart question={question} />
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
