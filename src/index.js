import React from 'react'

import Questionnaire from './components/Questionnaire'
import { provideTranslationContext } from './lib/TranslationsContext'

const Wrapper = (props) => {
  return <Questionnaire {...props} />
}

export default provideTranslationContext(Wrapper)
