import React, { Component } from 'react'

import { css } from 'glamor'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import CheckCircle from 'react-icons/lib/md/check-circle'
import withT from '../lib/withT'
import { errorToString } from '../lib/errors'

import {
  colors,
  Interaction,
  mediaQueries,
  InlineSpinner,
  fontFamilies,
  Loader
} from '@project-r/styleguide'
import { Chart, ChartTitle } from '@project-r/styleguide/chart'

import Question from './Question'

const { P, H2 } = Interaction

const styles = {
  count: css({
    background: '#fff',
    zIndex: 10,
    position: 'sticky',
    padding: '10px 0',
    borderBottom: `0.5px solid ${colors.divider}`,
    minHeight: 55,
    top: 0,
    [mediaQueries.onlyS]: {
      top: 0
    }
  }),
  reset: css({
    textAlign: 'center',
    marginTop: 10
  }),
  strong: css({
    fontFamily: fontFamilies.sansSerifMedium
  }),
  error: css({
    color: colors.error,
    fontFamily: fontFamilies.sansSerifMedium
  }),
  closed: css({
    marginTop: 35,
    background: colors.primaryBg,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    textAlign: 'center',
    marginBottom: 30
  }),
  progressIcon: css({
    marginLeft: 5,
    marginTop: 3,
    minHeight: 30
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

    const { data, t, meta } = this.props

    return (
      <Loader loading={data.loading} error={data.error} render={() => {
        const now = new Date()
        console.log({data})
        // handle not found or not started
        if (!data.questionnaire || new Date(data.questionnaire.beginDate) > now) {
          return (
            <div>
              Der Fragebogen konnte nicht gefunden werden.
            </div>
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
            <div {...styles.count}>
              { error
                ? <P {...styles.error}>{errorToString(error)}</P>
                : <>
                  <div style={{ display: 'flex' }}>
                    { userHasSubmitted
                      ? <P>Sie haben den Fragebogen bereits abgeschlossen.</P>
                      : <P {...styles.strong}>{t('questionnaire/header', { questionCount, userAnswerCount })}</P>
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
            {
              questions
                .slice(0, userHasSubmitted ? questionCount : userAnswerCount + 1)
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
  graphql(submitAnswerMutation, {
    props: ({ mutate, ownProps: { slug } }) => ({
      submitAnswer: (questionId, payload, answerId) => {
        return mutate({
          variables: {
            answerId,
            questionId,
            payload
          },
          /*
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
            const queryObj = { query, variables: { slug: router.query.slug } }
            const data = proxy.readQuery(queryObj)

            const questionIx = data.questionnaire.questions.findIndex(q => q.id === questionId)
            const question = data.questionnaire.questions[questionIx]
            question.userAnswer = submitAnswer.userAnswer

            console.log({ payload, submitAnswer})

            if (question.results) {
              const result = question.results.find( r =>
                r.option.value == submitAnswer.userAnswer.payload.value[0]
              )
              result.count++
            }

            proxy.writeQuery({ ...queryObj, data })
          },
          */
          refetchQueries: [{ query, variables: { slug } }]
        })
      }
    })
  }),
  graphql(query, {
    options: ({ slug }) => ({
      variables: {
        slug
      }
    })
  })
)(Page)
