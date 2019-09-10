import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

export const meQuery = gql`
  query me {
    me {
      id
    }
  }
`

export default graphql(meQuery, {
  props: ({ data }) => ({
    me: data.me
  })
})
