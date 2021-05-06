import React, { useContext } from 'react'

import { createFormatter } from '@project-r/styleguide'

import defaultTranslations from './translations.json'

export const TranslationContext = React.createContext(false)

export const provideTranslationContext = (Component) => ({ translations = [], ...props }) => {
  const formatterTranslations = [...defaultTranslations, ...translations]

  return (
    <TranslationContext.Provider value={createFormatter(formatterTranslations)}>
      <Component {...props} />
    </TranslationContext.Provider>
  )
}

export const withTranslations = (Compontent) => (props) => {
  const t = useContext(TranslationContext)

  return <Compontent {...props} t={t} />
}
