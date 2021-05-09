import React, { Component } from 'react'

import { css } from 'glamor'
import { compose, graphql, withApollo } from 'react-apollo'
import gql from 'graphql-tag'

import withMe from './Auth/withMe'

import { errorToString } from '../lib/errors'
import uuid from '../lib/uuid'
import { withTranslations } from '../lib/TranslationsContext'

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
  OverlayToolbarClose,
  OverlayBody,
  Button
} from '@project-r/styleguide'

import QuestionTypeChoice from './QuestionTypeChoice'
import QuestionTypeRange from './QuestionTypeRange'

const questionTypes = {
  QuestionTypeChoice,
  QuestionTypeRange
}

const { P } = Interaction

const styles = {
  container: css({
    marginBottom: 60
  }),
  count: css({
    zIndex: 10,
    minHeight: 25
  }),
  actions: css({
    ...fontStyles.sansSerifRegular18,
    [mediaQueries.lUp]: {
      display: 'flex'
    }
  }),
  action: css({
    marginRight: 20
  }),
  footer: css({
    ...fontStyles.sansSerifRegular18,
    margin: '10px 0'
  }),
  error: css({
    color: colors.error,
    fontFamily: fontFamilies.sansSerifMedium
  }),
  progressIcon: css({
    marginLeft: 5,
    marginTop: 3,
    minHeight: 30
  }),
  signIn: css({
    textAlign: 'center',
    margin: '40px 0'

  })
}

const getCache = key => {
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

class Questionnaire extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showResults: false,
      showOverlay: false
    }

    this.processSubmit = (fn, ...args) => {
      this.setState({ updating: true })
      return fn(...args)
        .then(() =>
          this.setState(() => ({
            updating: false,
            error: null,
          }))
        )
        .catch((error) => {
          this.setState(() => ({
            updating: false,
            submitting: false,
            error
          }))
        })
    }

    this.getPseudonym = () => {
      if (this.props.me) {
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

    this.createHandleChange = (questionnaire, question) => (answerId, value) => {
      const payload = value !== null ? { value } : null
      this.cacheUnattributedAnswer(
        questionnaire,
        question,
        payload,
        answerId
      )

      this.processSubmit(
        this.props.me
          ? this.props.submitAnswer
          : this.props.submitAnswerUnattributed,
        question,
        payload,
        answerId,
        this.getPseudonym()
      )
    }

    // Save state to local storage
    this.cacheUnattributedAnswer = (questionnaire, question, payload, answerId) => {
      if (!this.props.me && questionnaire.unattributedAnswers) {
        const cache = getCache(questionnaire.slug)

        const updatedCache = {
          ...cache,
          questions: (cache && cache.questions) || new Array(questionnaire.questions.length)
        }

        updatedCache.questions[question.order] = {
          userAnswer: {
            __typename: 'Answer',
            id: answerId,
            payload
          }
        }

        setCache(questionnaire.slug, updatedCache)
      }
    }
  }

  render () {
    const { data, me, t, hideAnonymize, settings } = this.props

    return (
      <Loader loading={data.loading} error={data.error} render={() => {
        const now = new Date()

        // handle not found or not started
        if (!data.questionnaire || new Date(data.questionnaire.beginDate) > now) {
          return (
            <P {...styles.error}>
              {t('questionnaire/notFound')}
            </P>
          )
        }

        const { questionnaire } = data
        const { unattributedAnswers, questions, userHasSubmitted } = questionnaire

        if ((!me || !me.id) && !unattributedAnswers) {
          return (
            <P {...styles.signIn}>{t('questionnaire/noUnattributedAnswers')}</P>
          )
        }

        // handle questions
        const { error, showResults, showOverlay } = this.state

        const questionsSet =
          questions
            .filter(q => {
              const { hide } = settings && settings.find(s => s.order === q.order) || {}
              return !hide
            })

        const questionCount = questionsSet
          .filter(Boolean)
          .length

        const userAnswerCount = questionsSet
          .map(q => q.userAnswer)
          .filter(Boolean)
          .length

        const answersSubmitted = questionCount === userAnswerCount || userHasSubmitted

        return (
          <div {...styles.container}>
            {questionsSet.map(question =>
              React.createElement(
                questionTypes[question.__typename],
                {
                  unattributed: !me,
                  showResults: answersSubmitted || showResults,
                  ...settings && settings.find(s => s.order === question.order),
                  onChange: this.createHandleChange(questionnaire, question),
                  questionnaire,
                  question,
                  key: question.id
                }
              )
            )}
            <div {...questionCount > 1 && styles.count}>
              { error &&
                <P {...styles.error}>{errorToString(error)}</P>
              }
              { userHasSubmitted && <P {...styles.footer}>{t('questionnaire/anon/submittedAlready')}</P> }
              { questionCount > 1 && (
                <P {...styles.footer}>
                  {t('questionnaire/header', { questionCount, userAnswerCount })}
                </P>
              ) }
              <div {...styles.actions}>
                { !showResults && !answersSubmitted &&
                  <div {...styles.action}>
                    <A href='#' onClick={(e) => {e.preventDefault(); this.setState({ showResults: true })}}>{t('questionnaire/preview')}</A>
                  </div>
                }
                { showResults && !answersSubmitted &&
                  <div {...styles.action}>
                    <A href='#' onClick={(e) => {e.preventDefault(); this.setState({ showResults: false })}}>
                      {t.pluralize('questionnaire/submit', { count: questionCount })}
                    </A>
                  </div>
                }
                { !hideAnonymize && me && answersSubmitted && !userHasSubmitted &&
                  <div {...styles.action}>
                    <A href='#' onClick={(e) => {e.preventDefault(); this.setState({ showOverlay: true })}}>{t('questionnaire/anon/intent')}</A>
                  </div>
                }
              </div>
              <P {...styles.footer} style={{ marginTop: 0 }}></P>
              { showOverlay &&
                <Overlay onClose={() => {this.setState({ showOverlay: false })}}>
                  <OverlayToolbar>
                    <OverlayToolbarClose onClick={() => {this.setState({ showOverlay: false })}} />
                  </OverlayToolbar>

                  <OverlayBody>
                    <P>
                      {t('questionnaire/anon/info')}</P>
                    <Button style={{ marginTop: 10 }} onClick={(e) => {
                      e.preventDefault()
                      this.processSubmit(
                        this.props.anonymizeUserAnswers,
                        questionnaire.id
                      )
                      this.setState({ showOverlay: false })
                    }} >
                      {t('questionnaire/anon/submit')}
                    </Button>
                  </OverlayBody>
                </Overlay>
              }
            </div>
          </div>
        )
      }} />
    )
  }
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
  anonymizeUserAnswers(
    questionnaireId: $questionnaireId
  ) {
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
    userIsEligible
    userHasSubmitted
    unattributedAnswers
    turnout { eligible submitted }
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
        turnout { skipped submitted }
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
      payload
    },

    /* Update results of choice question type */
    ...question.choiceResults && { choicesResults: question.choiceResults.map(r => ({
      ...r,
      count: r.count + (r.option.value == payload.value ? 1 : 0)
    }))},

    /* Update results of range question type */
    ...question.rangeResults && { rangeResults: {
      ...question.rangeResults,
      histogram: question.rangeResults.histogram.map(b => {
        if (payload.value >= b.x0 && payload.value < b.x1) {
          return { ...b, count: b.count + 1 }
        }

        return b
      })
    }},

    turnout: {
      ...question.turnout,
      submitted: question.turnout.submitted + 1
    }
  }
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
            histogramTicks
          },
          optimisticResponse: getOptimisticResponse('submitAnswer', question, payload, answerId)
        })
      }
    })
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
            histogramTicks
          },
          optimisticResponse: getOptimisticResponse('submitAnswerUnattributed', question, payload, answerId)
        })
      }
    })
  }),
  graphql(anonymizeUserAnswersMutation, {
    props: ({ mutate, ownProps: { slug } }) => ({
      anonymizeUserAnswers: (questionnaireId) => {
        return mutate({
          variables: {
            questionnaireId,
          },
          refetchQueries: [{ query, variables: { slug } }]
        })
      }
    })
  }),
  graphql(query, {
    options: ({ slug, pollInterval = 0, histogramTicks, client }) => ({
      pollInterval,
      variables: { slug, histogramTicks },
      onCompleted: (data) => {
        // Merge cached data into query cache if user is not eligable to submit and
        // unattributed answers are allowed.
        if (data.questionnaire && !data.questionnaire.userIsEligible && data.questionnaire.unattributedAnswers) {
          const cache = getCache(slug)

          if (cache && cache.questions) {
            const updatedData = {
              ...data,
              questionnaire: {
                ...data.questionnaire,
                questions: data.questionnaire.questions.map((question, order) => ({
                  ...question,
                  ...cache.questions[order]
                }))
              }
            }

            client.writeQuery({ query, variables: { slug }, data: updatedData })
          }
        }
      }
    })
  })
)(Questionnaire)
