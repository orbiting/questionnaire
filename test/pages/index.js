import React from 'react'

import { parse } from '@orbiting/remark-preset'
import createSchema from '@project-r/styleguide/lib/templates/Article'
import { createRequire } from '@project-r/styleguide/lib/components/DynamicComponent'

import * as reactApollo from 'react-apollo'
import * as graphqlTag from 'graphql-tag'

import Render from '../components/Render'
import md from '../article.md'

import { withRouter } from 'next/router'

const schema = createSchema({
  dynamicComponentRequire: createRequire().alias({
    'react-apollo': reactApollo,
    'graphql-tag': graphqlTag
  })
})
const mdast = parse(md)

export default withRouter(({ router }) => {
  return (
    <Render mdast={router.query.extract
      ? {...mdast, children: mdast.children.slice(+router.query.extract, +router.query.extract + 1)}
      : mdast
    } schema={schema} />
  )
})
