import buble from '@rollup/plugin-buble'
import {terser} from 'rollup-plugin-terser'

const plugins = [
  buble({
    objectAssign: true,
    transforms: {
      asyncAwait: false,
      spreadRest: false,
      generator: false,
      dangerousForOf: true,
    },
  }),
  terser(),
]

export default [{
  input: 'src/index.js',
  plugins,
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
  output: {
    file: 'index.js',
    format: 'cjs',
    exports: 'named',
    sourcemap: false,
    strict: false,
    globals: {react: 'React'},
  }
}];
