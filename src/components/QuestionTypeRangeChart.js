import React, { Component, Fragment } from 'react'
import { interpolate } from 'd3-interpolate'
import { css, merge } from 'glamor'

import { Label, colors, mediaQueries } from '@project-r/styleguide'
import { Chart } from '@project-r/styleguide/chart'

const styles = {
  chartLegend: css({
    display: 'flex',
    marginBottom: 20
  }),
  chartLegendColorSample: css({
    width: 2,
    marginRight: 4,
    [mediaQueries.lUp]: {
      width: 4
    }
  }),
  chartLegendLabel: css({
    paddingRight: 10
  }),
  rangeLegend: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20
  })
}

const isValueWithinBucket = (value, { x0, x1 }, isLast) =>
  Number.isFinite(value) &&
  value >= x0 &&
  (
    (!isLast && value < x1) ||
    (isLast && value <= x1)
  )

class QuestionTypeRangeChart extends Component {
  constructor(props) {
    super(props)

    const { question: { ticks } } = props

    this.colors = {
      // Default colors
      empty: 'white',
      min: colors.secondaryBg,
      max: colors.divider,
      answer: colors.primary,

      // Overwrite colors
      ...props.colors
    }
  
    this.getRangeColor = interpolate(this.colors.min, this.colors.max)

    this.ticks = {
      first: ticks[0],
      last: ticks[ticks.length - 1]
    }
  }

  render () {
    const { question, augmentedBins } = this.props
    if (!question || !question.rangeResults) {
      return null
    }

    const { userAnswer, rangeResults } = question
    const { histogram } = rangeResults

    const value = userAnswer && userAnswer.payload && userAnswer.payload.value

    const legend = (
      augmentedBins &&
      augmentedBins
        .filter(ab => ab.label)
        .map(ab => ({
          label: ab.label,
          color: ab.color
        }))
    ) || []

    const values = histogram.map((_, index) => ({ time: index + 1, value: '1' }))

    const max = histogram.reduce((prev, curr) => curr.count !== 0 && curr.count > prev.count ? curr : prev)
    const min = histogram.reduce((prev, curr) => curr.count !== 0 && curr.count < prev.count ? curr : prev)

    const colorRange = histogram.map((bin, index) => {
      // Paint augmented bin
      const augmentedBin =
        augmentedBins &&
        augmentedBins.find(augmentedBin => isValueWithinBucket(augmentedBin.value, bin, index === histogram.length - 1))

      if (augmentedBin) {
        return augmentedBin.color
      }

      // Add state.value to legend and paint as answer
      if (isValueWithinBucket(value, bin, index === histogram.length - 1)) {
        legend.push({
          label: 'Ihre Position',
          color: this.colors.answer
        })

        return this.colors.answer
      }

      // Paint bucket w/ count = 0 
      if (bin.count === 0) {
        return this.colors.empty
      }

      // Paint bin w/ range color
      // transpose value between 0 and 1
      const relativeValue = 1 / (max.count - min.count) * (bin.count - min.count)
      return this.getRangeColor(relativeValue || 1)
    })

    return (
      <>
        {/* Legend */}
        <div {...styles.chartLegend}>
          {legend.map(({ label, color }, index) => (
            <Fragment key={`label-${index}`}>
              <div {...merge(styles.chartLegendColorSample, { backgroundColor: color })} />
              <div {...styles.chartLegendLabel}>
                <Label style={{ color }}>{label}</Label>
              </div>
            </Fragment>
          ))}
        </div>

        <Chart
          config={{
            type: 'Bar',
            color: 'time',
            barStyle: 'large',
            highlight: 'true',
            xTicks: [],
            domain: [0, values.length],
            colorSort: 'none',
            sort: 'none',
            columnSort: 'none',
            colorRange,
            height: 1000
          }}
          values={values}
        />

        {/* Range Legend, labels | min ---> max | */}
        <div {...styles.rangeLegend}>
          <div>
            <Label>{this.ticks.first.label}</Label>
          </div>
          <div>
            <Label>{this.ticks.last.label}</Label>
          </div>
        </div>
      </>
    )
  }
}

export default QuestionTypeRangeChart