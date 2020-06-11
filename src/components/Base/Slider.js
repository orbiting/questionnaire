import React, { Component } from 'react'
import { css, merge } from 'glamor'

import { colors } from '@project-r/styleguide'

const DEFAULT_THUMB_SIZE = 24
const DEFAULT_TRACK_HEIGHT = 8
const DEFAULT_COLOR = colors.primary

export default class SliderThumbOnly extends Component {
  constructor(props) {
    super(props)

    const { thumbColor, thumbSize, trackHeight } = props

    const thumbStyle = {
      // border: '1px solid white',
      borderWidth: 0,
      borderRadius: '50%',
      width: thumbSize || DEFAULT_THUMB_SIZE,
      height: thumbSize || DEFAULT_THUMB_SIZE,
      background: thumbColor || DEFAULT_COLOR,
      outline: 'none'
    }
  
    const trackStyle = {
      background: 'transparent',
      height: trackHeight || DEFAULT_TRACK_HEIGHT
    }

    this.styles = {
      slider: css({
        WebkitAppearance: 'none',
        background: 'transparent',
        outline: 'none',
        width: '100%',
        padding: 0,
        marginTop: 0,
        marginRight: 10,
        marginBottom: 0,
        marginLeft: 0,
        verticalAlign: 'middle',
        ':focus': {
          outline: 'none'
        },
        // thumb
        '::-webkit-slider-thumb': {
          ...thumbStyle,
          WebkitAppearance: 'none',
          marginTop: ((thumbSize || 24) - (trackHeight || DEFAULT_TRACK_HEIGHT)) * -0.5
        },
        '::-moz-range-thumb': {
          ...thumbStyle
        },
        '::-ms-thumb': {
          ...thumbStyle
        },
        // track
        '::-webkit-slider-runnable-track': {
          ...trackStyle,
          width: '100%'
        },
        '::-moz-range-track': {
          ...trackStyle,
          width: '100%'
        },
        '::-ms-track': {
          width: '100%',
          borderColor: 'transparent',
          color: 'transparent',
          background: 'transparent',
          height: thumbSize || DEFAULT_THUMB_SIZE
        },
        '::-ms-fill-lower': {
          ...trackStyle
        },
        '::-ms-fill-upper': {
          ...trackStyle
        }
      })
    }
  }

  render () {
    const { min, max, step, value, thumbColor, onChange } = this.props

    const thumbColorStyle = css({
      // thumb
      '::-webkit-slider-thumb': {
        backgroundColor: thumbColor || DEFAULT_COLOR
      },
      '::-moz-range-thumb': {
        backgroundColor: thumbColor || DEFAULT_COLOR
      },
      '::-ms-thumb': {
        backgroundColor: thumbColor || DEFAULT_COLOR
      },
    })

    return (
      <input
        {...merge(this.styles.slider, thumbColorStyle)}
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(e, +e.target.value)} />
    )
  }
}