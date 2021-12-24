import React, { useState, useEffect } from 'react'
import { css } from 'glamor'
import { compose, graphql, withApollo } from 'react-apollo'
import gql from 'graphql-tag'

import {
  colors,
  mediaQueries,
  Interaction,
  fontFamilies,
  fontStyles,
  Loader,
  A,
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Button,
} from '@project-r/styleguide'

import withMe from './Auth/withMe'

import { errorToString } from '../lib/errors'
import uuid from '../lib/uuid'
import { withTranslations } from '../lib/TranslationsContext'

import QuestionTypeChoice from './QuestionTypeChoice'
import QuestionTypeRange from './QuestionTypeRange'
import MessageBox from './MessageBox'

const questionTypes = {
  QuestionTypeChoice,
  QuestionTypeRange,
}

const { P } = Interaction

const styles = {
  container: css({
    marginBottom: 60,
  }),
  count: css({
    zIndex: 10,
    minHeight: 25,
  }),
  actions: css({
    ...fontStyles.sansSerifRegular18,
    [mediaQueries.lUp]: {
      display: 'flex',
    },
  }),
  action: css({
    marginRight: 20,
  }),
  footer: css({
    ...fontStyles.sansSerifRegular18,
    margin: '10px 0',
  }),
  error: css({
    color: colors.error,
    fontFamily: fontFamilies.sansSerifMedium,
  }),
  progressIcon: css({
    marginLeft: 5,
    marginTop: 3,
    minHeight: 30,
  }),
  signIn: css({
    textAlign: 'center',
    margin: '40px 0',
  }),
}

const getCache = (key) => {
  try {
    const payload = localStorage.getItem(key)
    return JSON.parse(payload)
  } catch (e) {
    // Swallow error
  }

  return
}

const setCache = (key, payload) => {
  try {
    localStorage.setItem(key, JSON.stringify(payload))
  } catch (e) {
    // Swallow error
  }

  return payload
}

const Questionnaire = (props) => {
  const {
    data,
    me,
    t,
    hideAnonymize,
    hideAnswers,
    settings,
    submitAnswer,
    submitAnswerUnattributed,
    anonymizeUserAnswers,
  } = props

  const [showResults, setShowResults] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [error, setError] = useState()
  const [questionnaire, setQuestionnaire] = useState()

  // Clone query response questionnaire and merge with client cached data.
  useEffect(() => {
    if (data.questionnaire) {
      // Deep clone
      const questionnaire = JSON.parse(JSON.stringify(data.questionnaire))

      const { userIsEligible, unattributedAnswers, slug } = questionnaire

      // Merge client cached data if user is not eligable to submit an answer
      // and questionnaire allows for unattributed answers.
      if (!userIsEligible && !!unattributedAnswers) {
        const cache = getCache(slug)

        if (cache && cache.questions) {
          const mergedQuestionnaire = {
            ...questionnaire,
            questions: questionnaire.questions.map((question, order) => ({
              ...question,
              ...cache.questions[order],
            })),
          }

          return setQuestionnaire(mergedQuestionnaire)
        }
      }

      setQuestionnaire(questionnaire)
    }
  }, [data.questionnaire])

  const processSubmit = (fn, ...args) =>
    fn(...args)
      .then(() => {
        setError(null)
      })
      .catch((error) => {
        setError(error)
      })

  const getPseudonym = () => {
    if (me) {
      return
    }

    const cache = getCache('questionnaire')

    if (cache && cache.pseudonym) {
      return cache.pseudonym
    }

    const pseudonym = uuid()

    setCache('questionnaire', { ...cache, pseudonym })

    return pseudonym
  }

  const createHandleChange = (questionnaire, question) => (answerId, value) => {
    const payload = value !== null ? { value } : null
    cacheUnattributedAnswer(questionnaire, question, payload, answerId)

    processSubmit(
      me ? submitAnswer : submitAnswerUnattributed,
      question,
      payload,
      answerId,
      getPseudonym()
    )
  }

  const cacheUnattributedAnswer = (
    questionnaire,
    question,
    payload,
    answerId
  ) => {
    if (!me && questionnaire.unattributedAnswers) {
      const cache = getCache(questionnaire.slug)

      const updatedCache = {
        ...cache,
        questions:
          (cache && cache.questions) ||
          new Array(questionnaire.questions.length),
      }

      updatedCache.questions[question.order] = {
        userAnswer: {
          __typename: 'Answer',
          id: answerId,
          payload,
        },
      }

      setCache(questionnaire.slug, updatedCache)
    }
  }

  const loading =
    // Query is loading
    data.loading ||
    // Query is not loading, query returned a questionnaire but
    // questionnaire is not yet in state
    (!data.loading && data.questionnaire && !questionnaire)

  return (
    <Loader
      loading={loading}
      error={data.error}
      render={() => {
        const now = new Date()

        // handle not found or not started
        if (!questionnaire || new Date(questionnaire.beginDate) > now) {
          return <P {...styles.error}>{t('questionnaire/notFound')}</P>
        }

        const {
          unattributedAnswers,
          questions,
          userIsEligible,
          userHasSubmitted,
          endDate,
        } = questionnaire

        if (new Date(endDate) < now) {
          return (
            <div>
              <MessageBox>{t('questionnaire/ended')}</MessageBox>
            </div>
          )
        }
        if ((!me || !me.id) && unattributedAnswers) {
          return (
            <div>
              <MessageBox>
                {t('questionnaire/noUnattributedAnswers')}
              </MessageBox>
            </div>
          )
        } else if (!me || !me.id) {
          return (
            <div>
              <MessageBox>{t('questionnaire/notSignedIn')}</MessageBox>
            </div>
          )
        } else if (!userIsEligible) {
          return (
            <div>
              <MessageBox>{t('questionnaire/notEligible')}</MessageBox>
            </div>
          )
        }

        // handle questions
        const questionsSet = questions.filter((q) => {
          const { hide } =
            (settings && settings.find((s) => s.order === q.order)) || {}
          return !hide
        })

        const questionCount = questionsSet.filter(Boolean).length

        const userAnswerCount = questionsSet
          .map((q) => q.userAnswer)
          .filter(Boolean).length

        const answersSubmitted =
          questionCount === userAnswerCount || userHasSubmitted

        return (
          <div {...styles.container}>
            {questionsSet.map((question) =>
              React.createElement(questionTypes[question.__typename], {
                unattributed: !me,
                showResults: answersSubmitted || showResults,
                hideAnswers,
                ...(settings &&
                  settings.find((s) => s.order === question.order)),
                onChange: createHandleChange(questionnaire, question),
                questionnaire,
                question,
                key: question.id,
              })
            )}
            <div {...(questionCount > 1 && styles.count)}>
              {error && <P {...styles.error}>{errorToString(error)}</P>}
              {userHasSubmitted && (
                <P {...styles.footer}>
                  {t('questionnaire/anon/submittedAlready')}
                </P>
              )}
              {questionCount > 1 && (
                <P {...styles.footer}>
                  {t('questionnaire/header', {
                    questionCount,
                    userAnswerCount,
                  })}
                </P>
              )}
              <div {...styles.actions}>
                {!hideAnswers && !showResults && !answersSubmitted && (
                  <div {...styles.action}>
                    <A
                      href='#'
                      onClick={(e) => {
                        e.preventDefault()
                        setShowResults(true)
                      }}
                    >
                      {t('questionnaire/preview')}
                    </A>
                  </div>
                )}
                {showResults && !answersSubmitted && (
                  <div {...styles.action}>
                    <A
                      href='#'
                      onClick={(e) => {
                        e.preventDefault()
                        setShowResults(false)
                      }}
                    >
                      {t.pluralize('questionnaire/submit', {
                        count: questionCount,
                      })}
                    </A>
                  </div>
                )}
                {!hideAnonymize && me && answersSubmitted && !userHasSubmitted && (
                  <div {...styles.action}>
                    <A
                      href='#'
                      onClick={(e) => {
                        e.preventDefault()
                        setShowOverlay(true)
                      }}
                    >
                      {t('questionnaire/anon/intent')}
                    </A>
                  </div>
                )}
              </div>
              <P {...styles.footer} style={{ marginTop: 0 }}></P>
              {showOverlay && (
                <Overlay
                  onClose={() => {
                    setShowOverlay(false)
                  }}
                >
                  <OverlayToolbar
                    onClose={() => {
                      setShowOverlay(false)
                    }}
                  ></OverlayToolbar>

                  <OverlayBody>
                    <P>{t('questionnaire/anon/info')}</P>
                    <Button
                      style={{ marginTop: 10 }}
                      onClick={(e) => {
                        e.preventDefault()
                        processSubmit(anonymizeUserAnswers, questionnaire.id)
                        setShowOverlay(false)
                      }}
                    >
                      {t('questionnaire/anon/submit')}
                    </Button>
                  </OverlayBody>
                </Overlay>
              )}
            </div>
          </div>
        )
      }}
    />
  )
}

const mutationResult = `
  ... on QuestionTypeChoice {
    choiceResults: result {
      count
      option {
        label
        value
        category
      }
    }
  }
  ... on QuestionTypeRange {
    rangeResults: result {
      histogram(ticks: $histogramTicks) {
        x0
        x1
        count
      }
      mean
      median
      deviation
    }
  }
`

const submitAnswerMutation = gql`
mutation submitAnswer($answerId: ID!, $questionId: ID!, $payload: JSON, $histogramTicks: Int) {
  submitAnswer(answer: {
    id: $answerId,
    questionId: $questionId,
    payload: $payload
  }) {
    ... on QuestionInterface {
      id
      userAnswer {
        id
        payload
      }
      turnout { skipped submitted }
    }
    ${mutationResult}
  }
}
`

const submitAnswerUnattributedMutation = gql`
mutation submitAnswerUnattributed($answerId: ID!, $questionId: ID!, $payload: JSON, $pseudonym: ID!, $histogramTicks: Int) {
  submitAnswerUnattributed(answer: {
    id: $answerId,
    questionId: $questionId,
    payload: $payload
  } pseudonym: $pseudonym) {
    ... on QuestionInterface {
      id
      turnout { skipped submitted }
    }
    ${mutationResult}
  }
}
`

const anonymizeUserAnswersMutation = gql`
  mutation anonymizeUserAnswers($questionnaireId: ID!) {
    anonymizeUserAnswers(questionnaireId: $questionnaireId) {
      id
      userHasSubmitted
    }
  }
`

const query = gql`
  query getQuestionnaire($slug: String!, $histogramTicks: Int) {
    questionnaire(slug: $slug) {
      id
      slug
      beginDate
      endDate
      userIsEligible
      userHasSubmitted
      unattributedAnswers
      turnout {
        eligible
        submitted
      }
      questions {
        __typename
        ... on QuestionInterface {
          id
          text
          order
          metadata
          userAnswer {
            id
            payload
          }
          turnout {
            skipped
            submitted
          }
        }
        ... on QuestionTypeChoice {
          cardinality
          options {
            label
            value
            category
          }
          choiceResults: result {
            count
            option {
              label
              value
              category
            }
          }
        }
        ... on QuestionTypeRange {
          ticks {
            label
            value
          }
          rangeResults: result {
            histogram(ticks: $histogramTicks) {
              x0
              x1
              count
            }
            mean
            median
            deviation
          }
        }
      }
    }
  }
`

const getOptimisticResponse = (mutationName, question, payload, answerId) => ({
  __typename: 'Mutation',
  [mutationName]: {
    ...question,
    userAnswer: {
      __typename: 'Answer',
      id: answerId,
      payload,
    },

    /* Update results of choice question type */
    ...(question.choiceResults && {
      choiceResults: question.choiceResults.map((r) => {
        return {
          ...r,
          count: r.count + (payload.value.includes(r.option.value) ? 1 : 0),
        }
      }),
    }),

    /* Update results of range question type */
    ...(question.rangeResults && {
      rangeResults: {
        ...question.rangeResults,
        histogram: question.rangeResults.histogram.map((b) => {
          if (payload.value >= b.x0 && payload.value < b.x1) {
            return { ...b, count: b.count + 1 }
          }

          return b
        }),
      },
    }),

    turnout: {
      ...question.turnout,
      submitted: question.turnout.submitted + 1,
    },
  },
})

export default compose(
  withApollo,
  withMe,
  withTranslations,
  graphql(submitAnswerMutation, {
    props: ({ mutate, ownProps: { histogramTicks } }) => ({
      submitAnswer: (question, payload, answerId) => {
        return mutate({
          variables: {
            answerId,
            questionId: question.id,
            payload,
            histogramTicks,
          },
          optimisticResponse: getOptimisticResponse(
            'submitAnswer',
            question,
            payload,
            answerId
          ),
        })
      },
    }),
  }),
  graphql(submitAnswerUnattributedMutation, {
    props: ({ mutate, ownProps: { histogramTicks } }) => ({
      submitAnswerUnattributed: (question, payload, answerId, pseudonym) => {
        return mutate({
          variables: {
            answerId,
            questionId: question.id,
            payload,
            pseudonym,
            histogramTicks,
          },
          optimisticResponse: getOptimisticResponse(
            'submitAnswerUnattributed',
            question,
            payload,
            answerId
          ),
        })
      },
    }),
  }),
  graphql(anonymizeUserAnswersMutation, {
    props: ({ mutate, ownProps: { slug } }) => ({
      anonymizeUserAnswers: (questionnaireId) => {
        return mutate({
          variables: {
            questionnaireId,
          },
          refetchQueries: [{ query, variables: { slug } }],
        })
      },
    }),
  }),
  graphql(query, {
    options: ({ slug, pollInterval = 0, histogramTicks, client }) => ({
      pollInterval,
      variables: { slug, histogramTicks },
    }),
  })
)(Questionnaire)
