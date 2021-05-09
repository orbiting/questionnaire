import React, { Fragment, useMemo } from 'react'
import scaleCluster from 'd3-scale-cluster'
import { interpolate } from 'd3-interpolate'
import { css } from 'glamor'

import {
  Label,
  mediaQueries,
  useColorContext,
  ColorContextLocalExtension,
} from '@project-r/styleguide'
import { Chart } from '@project-r/styleguide/chart'
import {
  useTranslationContext,
} from '../lib/TranslationsContext'

const styles = {
  chartLegend: css({
    display: 'flex',
    marginBottom: 20,
  }),
  chartLegendColorSample: css({
    width: 2,
    marginRight: 4,
    [mediaQueries.lUp]: {
      width: 4,
    },
  }),
  chartLegendLabel: css({
    paddingRight: 10,
  }),
  rangeLegend: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  }),
}

const fallback = {
  colors: {
    min: '#fbfbfb',
    max: '#d6d6d6',
    answer: '#000000',
  },
  colorsDark: {
    min: '#232323',
    max: '#757575',
    answer: '#ffffff',
  },
}

const isValueWithinBin = (value, { x0, x1 }, isLast) =>
  Number.isFinite(value) &&
  value >= x0 &&
  ((!isLast && value < x1) || (isLast && value <= x1))

const generateColorsClusters = (min, max) => {
  const getColor = interpolate(min, max)
  const clusters = []

  clusters.push(getColor(0))
  for (let i = 1; i <= 10 - 1; i++) {
    clusters.push(getColor((1 / 10) * i))
  }

  return clusters
}

const getBinCount = (bin) => bin.count

const createColorGetter = (histogram, colors, colorsDark) => {
  const colorsClusters =
    colors.clusters ||
    generateColorsClusters(
      colors.min || fallback.colors.min,
      colors.max || fallback.colors.max
    )

  const colorsDarkClusters =
    colorsDark.clusters ||
    colors.clusters ||
    generateColorsClusters(
      colorsDark.min || fallback.colorsDark.min,
      colorsDark.max || fallback.colorsDark.max
    )

  const getColor = scaleCluster()
    .domain(histogram.map(getBinCount))
    .range(colorsClusters)

  const getColorDark = scaleCluster()
    .domain(histogram.map(getBinCount))
    .range(colorsDarkClusters)

  return (count) => {
    return {
      color: getColor(count),
      colorDark: getColorDark(count),
    }
  }
}

const spreadIndexToTime = (_, index) => ({ time: index + 1, value: '1' })

const LocalColorContext = (props) => {
  const { colorDarkMapping, children } = props

  const colorContextExtension = useMemo(() => {
    if (!colorDarkMapping) {
      return null
    }
    const keys = Object.keys(colorDarkMapping)
    return {
      localColors: keys.reduce(
        (localColors, key, i) => {
          localColors.dark[`charts${i}`] = colorDarkMapping[key]
          localColors.light[`charts${i}`] = key
          return localColors
        },
        { dark: {}, light: {} }
      ),
      localMappings: keys.reduce(
        (mappings, key, i) => {
          mappings.charts[key] = `charts${i}`
          return mappings
        },
        { charts: {} }
      ),
    }
  }, [colorDarkMapping])

  if (!colorContextExtension) {
    return children
  }

  return (
    <ColorContextLocalExtension {...colorContextExtension}>
      {children}
    </ColorContextLocalExtension>
  )
}

const Legend = ({ entries }) => {
  const [colorScheme] = useColorContext()
  const [t] = useTranslationContext()

  return (
    <div {...styles.chartLegend}>
      {entries.map(({ label, color, value }, index) => (
        <Fragment key={`label-${index}`}>
          <div
            {...styles.chartLegendColorSample}
            {...colorScheme.set('backgroundColor', color, 'charts')}
          />
          <div {...styles.chartLegendLabel}>
            <Label>
              <span {...colorScheme.set('color', color, 'charts')}>
                {t(label, { value }, label)}
              </span>
            </Label>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

/**
 * Chart will render a series of bars. Each bar is color-coded,
 * a color representing its value. Color is calculated using either:
 *  - a range {colors.min}, {colors.max}
 *  - a series {colors.cluster}
 *
 * If setting is available {colorsDark.*}, we will calculate a dark
 * color representation for each color-coded bar and pass along
 * to bar <Chart />.
 *
 */
const QuestionTypeRangeChart = (props) => {
  const [t] = useTranslationContext()

  const { question, augmentedBins, colors = {}, colorsDark = {} } = props

  if (!question || !question.rangeResults) {
    return null
  }

  const { userAnswer, rangeResults } = question
  const { histogram } = rangeResults

  const value = userAnswer && userAnswer.payload && userAnswer.payload.value

  const legend =
    (augmentedBins &&
      augmentedBins
        .filter((ab) => ab.label)
        .map(({ label, color, value }) => ({
          label,
          color,
          value: Math.round(value),
        }))) ||
    []

  const getColor = createColorGetter(histogram, colors, colorsDark)

  const colorDarkMapping = {}
  const colorRange = histogram.map((bin, index) => {
    // Paint augmented bin
    const augmentedBin =
      augmentedBins &&
      augmentedBins.find((augmentedBin) =>
        isValueWithinBin(
          augmentedBin.value,
          bin,
          index === histogram.length - 1
        )
      )

    if (augmentedBin) {
      const { color, colorDark } = augmentedBin

      if (colorDark) {
        colorDarkMapping[color] = colorDark
      }

      return color
    }

    // Add state.value to legend and paint as answer
    // render if augmented bins will not return value
    if (isValueWithinBin(value, bin, index === histogram.length - 1)) {
      const color = colors.answer || fallback.colors.answer
      const colorDark =
        colors.answerDark || colors.answer || fallback.colorsDark.answer

      legend.push({
        label: t('questionnaire/question/range/answer'),
        color,
      })

      colorDarkMapping[color] = colorDark

      return color
    }

    const { color, colorDark } = getColor(bin.count)
    if (colorDark) {
      colorDarkMapping[color] = colorDark
    }

    return color
  })

  const values = histogram.map(spreadIndexToTime)

  const ticks = {
    first: question.ticks[0],
    last: question.ticks[question.ticks.length - 1],
  }

  return (
    <>
      <LocalColorContext colorDarkMapping={colorDarkMapping}>
        <Legend entries={legend} />
      </LocalColorContext>

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
          colorDarkMapping,
          height: 1000,
        }}
        values={values}
      />

      {/* Range Legend, labels | min ---> max | */}
      <div {...styles.rangeLegend}>
        <div>
          <Label>{ticks.first.label}</Label>
        </div>
        <div>
          <Label>{ticks.last.label}</Label>
        </div>
      </div>
    </>
  )
}

export default QuestionTypeRangeChart
