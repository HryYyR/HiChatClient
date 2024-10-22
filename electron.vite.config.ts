import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import { terser } from 'rollup-plugin-terser';

export default defineConfig({

  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      terser({ compress: { drop_console: true, drop_debugger: true } })
    ]
  },
  renderer: {
    define: {
      'process.env': { ...process.env},
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          nested: resolve(__dirname, 'src/renderer/nested/index.html'),
        }
      },
      terserOptions: {
        compress: {
          //生产环境时移除console.log()
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    plugins: [vue()],
    base: './',

  },

})
