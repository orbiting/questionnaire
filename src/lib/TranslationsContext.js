import React, { useMemo, useContext } from 'react'

import { createFormatter } from '@project-r/styleguide'

import defaultTranslations from './translations.json'

export const TranslationContext = React.createContext(false)

export const provideTranslationContext = (Component) => ({ translations = [], ...props }) => {
  const formatterTranslations = [...defaultTranslations, ...translations]

  const formatter = useMemo(
    () => createFormatter(formatterTranslations),
    [formatterTranslations]
  )

  return (
    <TranslationContext.Provider value={formatter}>
      <Component {...props} />
    </TranslationContext.Provider>
  )
}

export const withTranslations = (Compontent) => (props) => {
  const t = useContext(TranslationContext)

  return <Compontent {...props} t={t} />
}

export const useTranslationContext = () => {
  const t = useContext(TranslationContext)
  return [t]
}
