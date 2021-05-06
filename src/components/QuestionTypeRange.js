import React, { Component } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import { Button, Interaction, Label, colors } from '@project-r/styleguide'

const { P } = Interaction

import uuid from '../lib/uuid'
import { withTranslations } from '../lib/TranslationsContext'

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

    const { questionnaire, question: { userAnswer, ticks }, showResults, slider, onChange } = props

    const userAnswerValue = (
      userAnswer &&
      userAnswer.payload &&
      userAnswer.payload.value
    )

    this.state = {
      value: userAnswerValue || undefined,
      answerId: (userAnswer && userAnswer.id) || uuid(),
      submitted: !!userAnswerValue,
      showResults
    }

    this.colors = {
      track: colors.secondaryBg,
      ...props.colors
    }

    this.ticks = {
      first: ticks[0],
      last: ticks[ticks.length - 1]
    }

    // Set set to slider 
    this.step = (slider && slider.step) || (this.ticks.last.value - this.ticks.first.value) / 100

    // Retrieve intial value for question in config slider.inital.path
    this.getInitialValue = () => {
      return get(
        questionnaire.questions, 
        slider && slider.initial && slider.initial.path
      )
    }

    // Retrieve value for slider; either state itself, initial value or halway between question ticks.
    this.getSliderValue = () => {
      return Number.isFinite(this.state.value)
        ? this.state.value
        : (this.getInitialValue() || (this.ticks.last.value - this.ticks.first.value) / 2 || 0)
    }

    this.submitValue = () => {
      this.setState(
        { submitted: true },
        () => onChange(this.state.answerId, this.getSliderValue())
      )
    }
  }

  render () {
    const { questionnaire, question, showResults, augments, t } = this.props
    const { value, submitted } = this.state
    const { text } = question

    // Create bins for chart w/ augments configs
    const augmentedBins = augments && augments.map(config => {
      const value = get(questionnaire.questions, config.path)

      // If value can't be retrieved, skip early
      if (!Number.isFinite(value)) {
        return
      }

      return {
        label: config.label,
        color: config.color,
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
                {Number.isFinite(this.getInitialValue()) && sliderValue === this.getInitialValue() && t.pluralize('questionnaire/question/range/keep', { count: sliderValue })}
                {Number.isFinite(this.getInitialValue()) && sliderValue !== this.getInitialValue() && t.pluralize('questionnaire/question/range/update', { count: sliderValue })}
                {!Number.isFinite(this.getInitialValue()) && t.pluralize('questionnaire/question/range/submit', { count: sliderValue })}
              </Button>
            </>
          }
          {(submitted || showResults) &&
            <Chart
              question={question}
              augmentedBins={augmentedBins}
              colors={this.colors} />
          }
        </div>
      </div>
    )
  }
}

export default withTranslations(QuestionTypeRange)