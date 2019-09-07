import React from 'react'

import { renderMdast } from 'mdast-react-render'
import visit from 'unist-util-visit'

const Render = ({ mdast, schema }) => {
  const jsUrl = require('file-loader!../../build/index.js')

  visit(mdast, 'zone', node => {
    if (node.identifier === 'DYNAMIC_COMPONENT' && node.data.src.match(/dynamic-components\/[^\/]+\/index\.js/)) {
      node.data.src = '/build/index.js' +
        '?u=' + encodeURIComponent(jsUrl)
    }
  })

  return <div key={jsUrl}>
    {renderMdast(mdast, schema)}
  </div>
}

export default Render
