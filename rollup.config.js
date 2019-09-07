import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import replace from 'rollup-plugin-replace'
import alias from 'rollup-plugin-alias'
import builtins from 'rollup-plugin-node-builtins'

import { join } from 'path'

export default [
  ['index.js']
].map(([entryFile, locale, outputFile]) => ({
  input: join('src', entryFile),
  output: {
    file: join('build', outputFile || entryFile),
    format: 'amd'
  },
  external: [
    // default
    'react', 'prop-types', 'glamor',
    '@project-r/styleguide', '@project-r/styleguide/chart',
    'react-apollo', 'graphql-tag'
  ],
  plugins: [
    // locale && replace({
    //   'translations.$locale.json': `translations.${locale}.json`
    // }),
    json(),
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
      presets: [
        "@babel/react",
        ["@babel/env", {
          "targets": {
            "browsers": ["last 2 versions", "safari >= 7"]
          },
          "modules": false
        }]
      ]
    }),
    replace({
      include: ['node_modules/uuid/**'],
      delimiters: ['', ''],
      values: {
        'crypto.randomBytes': 'require(\'randombytes\')'
      }
    }),
    builtins(),
    resolve(),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
  ].filter(Boolean)
}))
