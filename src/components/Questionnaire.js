import React, { Component } from 'react'

import { css } from 'glamor'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import CheckCircle from 'react-icons/lib/md/check-circle'
import withT from '../lib/withT'
import withMe from './Auth/withMe'
import { errorToString } from '../lib/errors'

import {
  colors,
  Interaction,
  mediaQueries,
  InlineSpinner,
  fontFamilies,
  fontStyles,
  Loader,
  Editorial,
  A,
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  OverlayBody,
  Button
} from '@project-r/styleguide'

import Question from './Question'

const { P } = Interaction
const { Note } = Editorial

const styles = {
  count: css({
    background: '#fff',
    zIndex: 10,
    borderTop: `0.5px solid ${colors.divider}`,
    minHeight: 25
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

class Page extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showOverlay: false
    }
  }

  render () {

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

    this.createHandleChange = (question) => (answerId, value) => {
      const payload = value !== null ? { value } : null
      this.processSubmit(
        this.props.submitAnswer,
        question, payload, answerId
      )
    }

    const { data, me, t, meta } = this.props

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

        if (!me || !me.id) {
          return (
            <P {...styles.signIn}>Damit wir Ihnen zeigen können wo Sie im Vergleich zu allen anderen stehen <A href="/anmelden">müssen Sie sich anmelden</A>. Sie benötigen keine Mitgliedschaft. Um Ihre Privatsphäre müssen Sie sich keine Sorgen machen: Sie können Ihre Antworten jederzeit wieder anonymisieren.</P>
          )
        }

        // handle questions
        const { questionnaire } = data
        const { questions, userHasSubmitted } = questionnaire

        const { error, submitting, updating, showOverlay } = this.state
        const questionCount = questions.filter(Boolean).length
        const userAnswerCount = questions.map(q => q.userAnswer).filter(Boolean).length

        return (
          <div>
            {
              questions
              //.slice(0, userHasSubmitted ? questionCount : userAnswerCount + 1)
              .map(q =>
                  React.createElement(
                    Question,
                    {
                      onChange: this.createHandleChange(q),
                      questionnaire,
                      question: q,
                      key: q.id
                    }
                  )
              )
            }
            <div {...styles.count}>
              { error &&
                <P {...styles.error}>{errorToString(error)}</P>
              }
              <div style={{ display: 'flex' }}>
                { userHasSubmitted
                  ? <P {...styles.footer}>Sie haben Ihre Antworten anonymisiert und können daher nicht noch einmal teilnehmen.</P>
                  : <P {...styles.footer}>{t('questionnaire/header', { questionCount, userAnswerCount })}</P>
                }
                { (updating || submitting) &&
                  <div style={{ marginLeft: 5, marginTop: 10 }}><InlineSpinner size={24} /></div>
                }
              </div>
              { !userHasSubmitted &&
                <P {...styles.footer} style={{ marginTop: 0 }}><A href='#' onClick={(e) => {e.preventDefault(); this.setState({ showOverlay: true })}}>Möchten Sie Ihre Antworten anonymisieren?</A></P>
              }
              { showOverlay &&
                <Overlay onClose={() => {this.setState({ showOverlay: false })}}>
                  <OverlayToolbar>
                    <OverlayToolbarClose onClick={() => {this.setState({ showOverlay: false })}} />
                  </OverlayToolbar>

                  <OverlayBody>
                    <P>Wenn Sie möchten, können Sie Ihre Antworten anonymisieren. Diese bleiben zwar in unserer Datenbank erhalten aber wir vergessen, dass sie von Ihnen stammen. Wir können Ihnen danach nicht mehr anzeigen was Sie geantwortet haben und Sie können keine Antworten mehr abgeben.</P>
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

const submitAnswerMutation = gql`
mutation submitAnswer($answerId: ID!, $questionId: ID!, $payload: JSON) {
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
    }
    ... on QuestionTypeChoice {
      results: result {
        count
        option {
          label
          value
          category
        }
      }
      turnout {skipped submitted}
    }
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
query getQuestionnaire($slug: String!) {
  questionnaire(slug: $slug) {
    id
    beginDate
    endDate
    userHasSubmitted
    userSubmitDate
    userIsEligible
    turnout { eligible submitted }
    questions {
      ... on QuestionInterface {
        id
        order
        text
        userAnswer {
          id
          payload
        }
      }
      ... on QuestionTypeChoice {
        cardinality
        options {
          label
          value
          category
        }
        results: result {
          count
          option {
            label
            value
            category
          }
        }
        turnout {skipped submitted}
      }
    }
  }
}
`

export default compose(
  withT,
  withMe,
  graphql(submitAnswerMutation, {
    props: ({ mutate, ownProps: { slug } }) => ({
      submitAnswer: (question, payload, answerId) => {
        return mutate({
          variables: {
            answerId,
            questionId: question.id,
            payload
          },
          optimisticResponse: {
            __typename: 'Mutation',
            submitAnswer: {
              __typename: 'QuestionTypeChoice',
              id: question.id,
              userAnswer: {
                __typename: 'Answer',
                id: answerId,
                payload
              },
              results: question.results.map(r => ({
                ...r,
                count: r.count + (r.option.value == payload.value
                  ? 1
                  : 0
                )
              })),
              turnout: {
                ...question.turnout,
                submitted: question.turnout.submitted + 1
              }
            }
          }
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
    options: ({ slug }) => ({
      pollInterval: 4000,
      variables: { slug }
    })
  })
)(Page)
