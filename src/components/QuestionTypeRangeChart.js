import React, { Component, Fragment } from 'react'
import { interpolate } from 'd3-interpolate'
import { css, merge } from 'glamor'

import { Label, colors, mediaQueries } from '@project-r/styleguide'
import { Chart } from '@project-r/styleguide/chart'

import withT from '../lib/withT'

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
    const { question, buckets, t } = this.props
    if (!question || !question.rangeResults) {
      return null
    }

    const { userAnswer, rangeResults } = question
    const { histogram } = rangeResults

    const value = userAnswer && userAnswer.payload && userAnswer.payload.value

    const legend = (buckets && buckets.filter(b => b.label).map(b => ({
      label: b.label,
      color: b.color
    }))) || []

    const values = histogram.map((bucket, index) => ({ time: index + 1, value: '1' }))

    const max = histogram.reduce((prev, curr) => curr.count !== 0 && curr.count > prev.count ? curr : prev)
    const min = histogram.reduce((prev, curr) => curr.count !== 0 && curr.count < prev.count ? curr : prev)

    const colorRange = histogram.map((bucket, index) => {
      const augmentedBucket = buckets && buckets.find(({ value }) =>
        Number.isFinite(value) &&
        value >= bucket.x0 &&
        (
          (index !== histogram.length - 1 && value < bucket.x1) || // Not last bucket
          (index === histogram.length - 1 && value <= bucket.x1) // Last bucket
        )
      )

      if (augmentedBucket) {
        return augmentedBucket.color
      }

      // «Meine Antwort»
      if (
        Number.isFinite(value) &&
        value >= bucket.x0 &&
        (
          (index !== histogram.length - 1 && value < bucket.x1) || // Not last bucket
          (index === histogram.length - 1 && value <= bucket.x1) // Last bucket
        )
      ) {
        legend.push({
          label: 'Ihre Position',
          color: this.colors.answer
        })

        return this.colors.answer
      }

      // Paint bucket w/ count = 0 in lowester color
      if (bucket.count === 0) {
        return this.colors.empty
      }

      // Return color on specturm
      return this.getRangeColor((1 / (max.count - min.count) * (bucket.count - min.count) || 1))
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

export default withT(QuestionTypeRangeChart)