import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

export default [
  // Background script
  {
    input: 'src/background.js',
    output: {
      sourcemap: !production,
      format: 'iife', // Immediately-invoked function expression
      name: 'background',
      file: 'dist/src/background.js'
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      production && terser()
    ]
  },



  
  // Content script with Svelte
  {
    input: 'src/content.js',
    output: {
      sourcemap: !production,
      format: 'iife',
      name: 'content',
      file: 'dist/src/content.js'
    },
    plugins: [
      svelte({
        compilerOptions: {
          // Enable run-time checks when not in production
          dev: !production
        }
      }),
      
      // Extract CSS into a separate file
      css({ output: 'content.css' }),
      
      // Resolve node modules
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      
      commonjs(),
      
      // Minify in production
      production && terser()
    ]
  },
  
  // Popup script with Svelte
  {
    input: 'src/popup.js',
    output: {
      sourcemap: !production,
      format: 'iife',
      name: 'popup',
      file: 'dist/src/popup.js'
    },
    plugins: [
      svelte({
        compilerOptions: {
          dev: !production
        }
      }),
      css({ output: 'popup.css' }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      production && terser()
    ]
  }
]; 