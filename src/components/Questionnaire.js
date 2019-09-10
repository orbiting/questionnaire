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
  Loader,
  Editorial,
  A
} from '@project-r/styleguide'

import Question from './Question'

const { P } = Interaction
const { Note } = Editorial

const styles = {
  count: css({
    background: '#fff',
    zIndex: 10,
    borderTop: `0.5px solid ${colors.divider}`,
    minHeight: 25,
    //position: 'sticky',
    //bottom: 0,
    //[mediaQueries.onlyS]: {
    //  bottom: 0
    //}
  }),
  strong: css({
    fontFamily: fontFamilies.sansSerifMedium,
    margin: 10
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
    this.state = {}
  }

  render () {

    this.processSubmit = (fn, ...args) => {
      this.setState({ updating: true })
      return fn(...args)
        .then(() =>
          this.setState(() => ({
            updating: false,
            error: null
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

    this.createHandleChange = (questionId) => (answerId, value) => {
      const payload = value !== null ? { value } : null
      this.processSubmit(
        this.props.submitAnswer,
        questionId, payload, answerId
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
            <P {...styles.signIn}>Damit wir Ihnen zeigen können wo Sie im Vergleich zu allen anderen stehen <A href="https://www.republik.ch/anmelden">müssen Sie sich anmelden</A>. Sie benötigen keine Mitgliedschaft. Um Ihre Privatsphäre müssen Sie sich keine Sorgen machen: Sie können Ihre Antworten jederzeit wieder löschen.</P>
          )
        }

        // handle questions
        const { questionnaire } = data
        const { questions, userHasSubmitted } = questionnaire

        const { error, submitting, updating } = this.state
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
                      onChange: this.createHandleChange(q.id),
                      questionnaire,
                      question: q,
                      key: q.id
                    }
                  )
              )
            }
            <div {...styles.count}>
              { error
                ? <P {...styles.error}>{errorToString(error)}</P>
                : <>
                <div style={{ display: 'flex' }}>
                  { userHasSubmitted
                    ? <Note>Sie haben den Fragebogen bereits abgeschlossen.</Note>
                    : <Note {...styles.strong}>{t('questionnaire/header', { questionCount, userAnswerCount })}</Note>
                  }
                  {
                    questionCount === userAnswerCount
                      ? <div {...styles.progressIcon}><CheckCircle size={22} color={colors.primary} /></div>
                      : (updating || submitting)
                      ? <div style={{ marginLeft: 5, marginTop: 3 }}><InlineSpinner size={24} /></div>
                      : null
                  }
                </div>
                </>
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
      submitAnswer: (questionId, payload, answerId) => {
        return mutate({
          variables: {
            answerId,
            questionId,
            payload
          },
          optimisticResponse: {
            __typename: 'Mutation',
            submitAnswer: {
              __typename: 'QuestionInterface',
              id: questionId,
              userAnswer: {
                __typename: 'Answer',
                id: answerId,
                payload
              }
            }
          },
          update: (proxy, { data: { submitAnswer } }) => {
            const queryObj = { query, variables: { slug } }
            const data = proxy.readQuery(queryObj)

            const questionIx = data.questionnaire.questions.findIndex(q => q.id === questionId)
            const question = data.questionnaire.questions[questionIx]
            question.userAnswer = submitAnswer.userAnswer

            if (question.results) {
              const result = question.results.find( r =>
                r.option.value == submitAnswer.userAnswer.payload.value[0]
              )
              result.count++
            }
            if (question.turnout) {
              question.turnout.submitted++
            }

            proxy.writeQuery({ ...queryObj, data })
          }
        })
      }
    })
  }),
  graphql(query, {
    options: ({ slug }) => ({
      pollInterval: 5000,
      variables: { slug }
    })
  })
)(Page)
