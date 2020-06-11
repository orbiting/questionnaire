import React, { Component } from 'react'

import { css } from 'glamor'
import { compose, graphql, withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import withT from '../lib/withT'
import withMe from './Auth/withMe'
import { errorToString } from '../lib/errors'
import uuid from '../lib/uuid'

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
    background: '#fff',
    zIndex: 10,
    borderTop: `0.5px solid ${colors.divider}`,
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

      try {
        const currentStorageItem = localStorage.getItem('questionnaire')
        const currentCache = currentStorageItem && JSON.parse(currentStorageItem)
    
        if (currentCache && currentCache.pseudonym) {
          return currentCache.pseudonym
        }
    
        const pseudonym = uuid()
    
        localStorage.setItem('questionnaire', JSON.stringify({
          ...currentCache,
          pseudonym
        }))
    
        return pseudonym
      } catch (e) {
        console.log(e)
        // Swallow error
      }
    
      return uuid()
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
      try {
        if (!this.props.me && questionnaire.unattributedAnswers) {
          const currentStorageItem = localStorage.getItem(questionnaire.slug)
          const currentCache = currentStorageItem && JSON.parse(currentStorageItem)

          const updatedCache = {
            ...currentCache,
            questions: (currentCache && currentCache.questions) || new Array(questionnaire.questions.length)
          }

          updatedCache.questions[question.order] = {
            userAnswer: {
              __typename: 'Answer',
              id: answerId,
              payload
            }
          }

          localStorage.setItem(questionnaire.slug, JSON.stringify(updatedCache))
        }
      } catch (e) {
        /* Swallow errors */
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
              Der Fragebogen konnte nicht gefunden werden.
            </P>
          )
        }

        const { questionnaire } = data
        const { unattributedAnswers, questions, userHasSubmitted } = questionnaire

        if ((!me || !me.id) && !unattributedAnswers) {
          return (
            <P {...styles.signIn}>Damit wir Ihnen zeigen können wo Sie im Vergleich zu allen anderen stehen <A href="/anmelden">müssen Sie sich anmelden</A>. Sie benötigen keine Mitgliedschaft. Um Ihre Privatsphäre müssen Sie sich keine Sorgen machen: Sie können Ihre Antworten jederzeit wieder anonymisieren.</P>
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
              { userHasSubmitted && <P {...styles.footer}>Sie haben Ihre Antworten anonymisiert und können daher nicht noch einmal teilnehmen.</P> }
              { questionCount > 1 && (
                <P {...styles.footer}>
                  {t('questionnaire/header', { questionCount, userAnswerCount })}
                </P>
              ) }
              { /* @TODO: Updating-Spinner */ }
              <div {...styles.actions}>
                { !showResults && !answersSubmitted &&
                  <div {...styles.action}>
                    <A href='#' onClick={(e) => {e.preventDefault(); this.setState({ showResults: true })}}>Nur Antworten von anderen anzeigen</A>
                  </div>
                }
                { showResults && !answersSubmitted &&
                  <div {...styles.action}>
                    <A href='#' onClick={(e) => {e.preventDefault(); this.setState({ showResults: false })}}>
                      {questionCount > 1 ? 'Ihre Antworten übermitteln' : 'Ihre Antwort übermitteln'}
                    </A>
                  </div>
                }
                { !hideAnonymize && me && answersSubmitted && !userHasSubmitted &&
                  <div {...styles.action}>
                    <A href='#' onClick={(e) => {e.preventDefault(); this.setState({ showOverlay: true })}}>Ihre Antworten anonymisieren</A>
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
                    <P>Wenn Sie möchten, können Sie Ihre Antworten anonymisieren. Diese bleiben zwar in unserer Datenbank erhalten, aber wir vergessen, dass sie von Ihnen stammen. Wir können Ihnen danach nicht mehr anzeigen, was Sie geantwortet haben, und Sie können keine Antworten mehr abgeben.</P>
                    <Button style={{ marginTop: 10 }} onClick={(e) => {
                      e.preventDefault()
                      this.processSubmit(
                        this.props.anonymizeUserAnswers,
                        questionnaire.id
                      )
                      this.setState({ showOverlay: false })
                    }} >
                      Anonymisieren
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
        kind
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
  withT,
  withMe,
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
    options: ({ slug, pollInterval = 0, histogramTicks, me, client }) => ({
      pollInterval,
      variables: { slug, histogramTicks },
      onCompleted: data => {
        try {
          if (!me && data.questionnaire && data.questionnaire.unattributedAnswers) {
            const currentStorageItem = localStorage.getItem(slug)
            const currentCache = currentStorageItem && JSON.parse(currentStorageItem)

            if (currentCache && currentCache.questions) {
              const updatedData = {
                ...data,
                questionnaire: {
                  ...data.questionnaire,
                  questions: data.questionnaire.questions.map((question, order) => {
                    const cachedQuestion = currentCache.questions[order]

                    return {
                      ...question,
                      ...cachedQuestion
                    }
                  })
                }
              }

              client.writeQuery({ query, variables: { slug }, data: updatedData })
            }
          }
        } catch (e) {
          // Swallow error
        }
      }
    })
  })
)(Questionnaire)
