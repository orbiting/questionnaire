import React, { Component } from 'react'
import { css } from 'glamor'
//import uuid from 'uuid/v4'

import {
  Interaction,
  Button,
  fontStyles,
  fontFamilies,
  colors
} from '@project-r/styleguide'
const { H2, H3, P } = Interaction
import withT from '../lib/withT'

const styles = {
  body: css({
    margin: '5px 0 10px 0',
    display: 'flex',
    width: '100%',
    textAlign: 'center'
  }),
  label: css({
    margin: '50px 0 10px 0'
  }),
  option: css({
    width: '50%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  }),
  resultBars: css({
    position: 'relative',
    width: '100%',
    height: '50px'
  }),
  resultBar: css({
    position: 'absolute',
    bottom: 0,
    height: '100%'
  })
}


// TODO fix uuid/v4
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class ChoiceQuestion extends Component {
  constructor (props) {
    super(props)
    this.state = {
      answerId: (props.question.userAnswer && props.question.userAnswer.id) || uuidv4(),
    }
  }
  render () {

    this.handleChange = (value) => {
      const { onChange, question: { userAnswer, cardinality } } = this.props
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

    const { question: { id, text, userAnswer, options, results } } = this.props

    const optionsWithResult = options.map(o => ({
      ...o,
      result: results.find(r => r.option.value === o.value)
    }))

    const numSubmitted = optionsWithResult.reduce(
      (agg, o) => o.result ? o.result.count + agg : agg,
      0
    )

    const getBarWidth = (option) =>
      numSubmitted > 0
        ? `${Math.max(100 / numSubmitted * option.result.count, 1)}%`
        : 1

    const getBarColor = ({ value }) => 'black'
    // value === 'true' ? colors.discrete[2] : colors.discrete[3]

    const getOpacity = ({ value }) =>
      value == userAnswer.payload.value ? 1.0 : 0.4

    return (
      <div>
        <div {...styles.label}>
          { text &&
          <H3>{text}</H3>
          }
        </div>
        <div {...styles.body} style={{ minHeight: '80px' }}>
          { optionsWithResult.map(option =>
            <div {...styles.option} key={`${id}-${option.value}`}>
              { !userAnswer &&
                <Button
                  onClick={() => this.handleChange(option.value)}
                >
                  {option.label}
                </Button>
              }
              { userAnswer &&
                <div style={{ width: '100%', opacity: getOpacity(option) }}>
                  <div {...styles.resultBars}>
                    <div {...styles.resultBar} style={{
                      backgroundColor: getBarColor(option),
                      width: getBarWidth(option),
                      ...(option.value === 'true') ? { right: 0 } : { left: 0 }
                    }} />
                  </div>
                  <div style={{
                    textAlign: option.value === 'true' ? 'right' : 'left',
                    margin: '5px'
                  }}>
                    {option.label}<br />
                    {option.result.count}<br />
                    {`${Math.round(100 / numSubmitted * option.result.count)}%`}<br />
                    {option.value == userAnswer.payload.value ? 'Ihre Antwort!' : ''}
                  </div>
                </div>
              }
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default withT(ChoiceQuestion)
