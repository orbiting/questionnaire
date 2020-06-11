import React, { Component } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import { Button, Interaction, Label, colors } from '@project-r/styleguide'

const { P } = Interaction

import uuid from '../lib/uuid'
import withT from '../lib/withT'
import Slider from './Base/Slider'
import Chart from './QuestionTypeRangeChart'

const styles = {
  question: css({
    marginBottom: 20
  }),
  content: css({
    marginTop: 30,
    marginBottom: 30,
    minHeight: 130
  }),
  sliderLegend: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20
  })
}

class QuestionTypeRange extends Component {
  constructor (props) {
    super(props)

    const { question: { userAnswer, ticks }, showResults, slider } = props

    this.colors = {
      track: colors.secondaryBg,
      ...props.colors
    }

    this.ticks = {
      first: ticks[0],
      last: ticks[ticks.length - 1]
    }

    this.step = (slider && slider.step) || (this.ticks.last.value - this.ticks.first.value) / 100

    const userAnswerValue = (
      userAnswer &&
      userAnswer.payload &&
      userAnswer.payload.value
    )

    this.state = {
      value: userAnswerValue || undefined,
      answerId: (props.question.userAnswer && props.question.userAnswer.id) || uuid(),
      submitted: !!userAnswerValue,
      showResults
    }

    this.getInitialValue = () => {
      return get(
        this.props.questionnaire.questions, 
        this.props.slider && this.props.slider.initial && this.props.slider.initial.path
      )
    }

    this.getSliderValue = () => {
      return Number.isFinite(this.state.value)
        ? this.state.value
        : (this.getInitialValue() || (this.ticks.last.value - this.ticks.first.value) / 2 || 0.5)
    }

    this.submitValue = () => {
      this.setState(
        { submitted: true },
        () => {
          const { answerId } = this.state
          this.props.onChange(answerId, this.getSliderValue())
        }
      )
    }
  }

  render () {
    const { questionnaire, question, showResults, augments } = this.props
    const { value, submitted } = this.state
    const { text } = question

    const buckets = augments && augments.map(augment => {
      const value = get(questionnaire.questions, augment.path)

      if (!Number.isFinite(value)) {
        return
      }

      return {
        label: augment.label,
        color: augment.color,
        value
      }
    }).filter(Boolean)

    const sliderValue = this.getSliderValue()
  
    return (
      <div>
        <P {...styles.question}>{text}</P>
        <div {...styles.content}>
          {!submitted && !showResults &&
            <>
              {/* Slider with track */}
              <div style={{position: 'relative', minHeight: 20}}>
                {/* Track */}
                <div style={{position: 'absolute', width: '100%', marginTop: 6}}>
                  <div style={{height: 8, backgroundColor: this.colors.track}} />
                </div>

                {/* Slider */}
                <div style={{position: 'absolute', width: '100%'}}>
                  <Slider
                    min={this.ticks.first.value}
                    max={this.ticks.last.value}
                    step={this.step}
                    value={sliderValue}
                    onChange={(_, value) => this.setState({ value })} />
                </div>
              </div>

              {/* Slider Legend, Labels | min ---> max | */}
              <div {...styles.sliderLegend}>
                <div>
                  <Label>{this.ticks.first.label}</Label>
                </div>
                <div>
                  <Label>{this.ticks.last.label}</Label>
                </div>
              </div>

              {/* Submit button */}
              <Button primary block disabled={!Number.isFinite(value) && !this.getInitialValue()} onClick={this.submitValue}>
                {Number.isFinite(this.getInitialValue()) && this.getSliderValue() === this.getInitialValue() && 'Unveränderte Position speichern'}
                {Number.isFinite(this.getInitialValue()) && this.getSliderValue() !== this.getInitialValue() && 'Neue Position speichern'}
                {!Number.isFinite(this.getInitialValue()) && 'Position speichern'}
              </Button>
            </>
          }
          {(submitted || showResults) &&
            <Chart
              question={question}
              buckets={buckets}
              colors={this.colors} />
          }
        </div>
      </div>
    )
  }
}

export default withT(QuestionTypeRange)