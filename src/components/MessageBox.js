import React from 'react'

import { css } from 'glamor'

import {
  useColorContext,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'

const styles = {
  box: css({
    display: 'block',
    margin: '10px 0',
    padding: 20,
    textAlign: 'center',
  }),
  text: css({
    ...fontStyles.sansSerifRegular17,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular21,
    },
  }),
}

const MessageBox = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.box}
      {...styles.text}
      {...colorScheme.set('backgroundColor', 'alert')}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </div>
  )
}

export default MessageBox
