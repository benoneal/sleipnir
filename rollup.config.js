import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import babel from 'rollup-plugin-babel'
import {uglify} from 'rollup-plugin-uglify'

const plugins = [
  babel({
    babelrc: false,
    exclude: 'node_modules/**',
  }),
  buble({objectAssign: 'Object.assign'}),
  resolve({browser: true}),
  commonjs({sourceMap: false}),
  uglify({
    sourcemap: false,
    mangle: true,
    compress: {negate_iife: false, expression: true},
  }),
]

export default {
  input: 'src/index.js',
  plugins,
  external: ['react-redux'],
  output: {
    file: 'index.js',
    format: 'cjs',
    exports: 'named',
    strict: false,
    treeshake: {
      pureExternalModules: true,
    }
  }
}
