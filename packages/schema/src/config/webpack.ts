import { defu } from 'defu'
import { defineResolvers } from '../utils/definition'

export default defineResolvers({
  webpack: {
    /**
     * Nuxt uses `webpack-bundle-analyzer` to visualize your bundles and how to optimize them.
     *
     * Set to `true` to enable bundle analysis, or pass an object with options: [for webpack](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin) or [for vite](https://github.com/btd/rollup-plugin-visualizer#options).
     * @example
     * ```js
     * analyze: {
     *   analyzerMode: 'static'
     * }
     * ```
     */
    analyze: {
      $resolve: async (val, get) => {
        const value = typeof val === 'boolean' ? { enabled: val } : (val && typeof val === 'object' ? val : {})
        return defu(value, await get('build.analyze') as { enabled?: boolean } | Record<string, unknown>)
      },
    },

    /**
     * Enable the profiler in webpackbar.
     *
     * It is normally enabled by CLI argument `--profile`.
     * @see [webpackbar](https://github.com/unjs/webpackbar#profile).
     */
    profile: process.argv.includes('--profile'),

    /**
     * Enables Common CSS Extraction.
     *
     * Using [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) under the hood, your CSS will be extracted
     * into separate files, usually one per component. This allows caching your CSS and
     * JavaScript separately.
     * @example
     * ```js
     * export default {
     *   webpack: {
     *     extractCSS: true,
     *     // or
     *     extractCSS: {
     *       ignoreOrder: true
     *     }
     *   }
     * }
     * ```
     *
     * If you want to extract all your CSS to a single file, there is a workaround for this.
     * However, note that it is not recommended to extract everything into a single file.
     * Extracting into multiple CSS files is better for caching and preload isolation. It
     * can also improve page performance by downloading and resolving only those resources
     * that are needed.
     * @example
     * ```js
     * export default {
     *   webpack: {
     *     extractCSS: true,
     *     optimization: {
     *       splitChunks: {
     *         cacheGroups: {
     *           styles: {
     *             name: 'styles',
     *             test: /\.(css|vue)$/,
     *             chunks: 'all',
     *             enforce: true
     *           }
     *         }
     *       }
     *     }
     *   }
     * }
     * ```
     */
    extractCSS: true,

    /**
     * Enables CSS source map support (defaults to `true` in development).
     */
    cssSourceMap: {
      $resolve: async (val, get) => typeof val === 'boolean' ? val : await get('dev'),
    },

    /**
     * The polyfill library to load to provide URL and URLSearchParams.
     *
     * Defaults to `'url'` ([see package](https://www.npmjs.com/package/url)).
     */
    serverURLPolyfill: 'url',

    /**
     * Customize bundle filenames.
     *
     * To understand a bit more about the use of manifests, take a look at [webpack documentation](https://webpack.js.org/guides/code-splitting/).
     * @note Be careful when using non-hashed based filenames in production
     * as most browsers will cache the asset and not detect the changes on first load.
     *
     * This example changes fancy chunk names to numerical ids:
     * @example
     * ```js
     * filenames: {
     *   chunk: ({ isDev }) => (isDev ? '[name].js' : '[id].[contenthash].js')
     * }
     * ```
     *  Record<
     *    string,
     *    string |
     *    ((
     *      ctx: {
     *        nuxt: import('../src/types/nuxt').Nuxt,
     *        options: import('../src/types/nuxt').Nuxt['options'],
     *        name: string,
     *        isDev: boolean,
     *        isServer: boolean,
     *        isClient: boolean,
     *        alias: { [index: string]: string | false | string[] },
     *        transpile: RegExp[]
     *      }) => string)
     *  >
     * }
     */
    filenames: {
      app: ({ isDev }: { isDev: boolean }) => isDev ? '[name].js' : '[contenthash:7].js',
      chunk: ({ isDev }: { isDev: boolean }) => isDev ? '[name].js' : '[contenthash:7].js',
      css: ({ isDev }: { isDev: boolean }) => isDev ? '[name].css' : 'css/[contenthash:7].css',
      img: ({ isDev }: { isDev: boolean }) => isDev ? '[path][name].[ext]' : 'img/[name].[contenthash:7].[ext]',
      font: ({ isDev }: { isDev: boolean }) => isDev ? '[path][name].[ext]' : 'fonts/[name].[contenthash:7].[ext]',
      video: ({ isDev }: { isDev: boolean }) => isDev ? '[path][name].[ext]' : 'videos/[name].[contenthash:7].[ext]',
    },

    /**
     * Customize the options of Nuxt's integrated webpack loaders.
     */
    loaders: {
      $resolve: async (val, get) => {
        const loaders: Record<string, any> = val && typeof val === 'object' ? val : {}
        const styleLoaders = [
          'css', 'cssModules', 'less',
          'sass', 'scss', 'stylus', 'vueStyle',
        ]
        for (const name of styleLoaders) {
          const loader = loaders[name]
          if (loader && loader.sourceMap === undefined) {
            loader.sourceMap = Boolean(
              // @ts-expect-error TODO: remove legacay configuration
              await get('build.cssSourceMap'),
            )
          }
        }
        return loaders
      },

      /**
       * @see [esbuild loader](https://github.com/esbuild-kit/esbuild-loader)
       */
      esbuild: {
        $resolve: async (val, get) => {
          return defu(val && typeof val === 'object' ? val : {}, await get('esbuild.options'))
        },
      },

      /**
       * @see [`file-loader` Options](https://github.com/webpack-contrib/file-loader#options)
       */
      file: { esModule: false, limit: 1000 },

      /**
       * @see [`file-loader` Options](https://github.com/webpack-contrib/file-loader#options)
       */
      fontUrl: { esModule: false, limit: 1000 },

      /**
       * @see [`file-loader` Options](https://github.com/webpack-contrib/file-loader#options)
       */
      imgUrl: { esModule: false, limit: 1000 },

      /**
       * @see [`pug` options](https://pugjs.org/api/reference.html#options)
       */
      pugPlain: {},

      /**
       * See [vue-loader](https://github.com/vuejs/vue-loader) for available options.
       */
      vue: {
        transformAssetUrls: {
          $resolve: async (val, get) => (val ?? (await get('vue.transformAssetUrls'))),
        },
        compilerOptions: {
          $resolve: async (val, get) => (val ?? (await get('vue.compilerOptions'))),
        },
        propsDestructure: {
          $resolve: async (val, get) => Boolean(val ?? await get('vue.propsDestructure')),
        },
      },

      /**
       * See [css-loader](https://github.com/webpack-contrib/css-loader) for available options.
       */
      css: {
        importLoaders: 0,
        url: {
          filter: (url: string, _resourcePath: string) => url[0] !== '/',
        },
        esModule: false,
      },

      /**
       * See [css-loader](https://github.com/webpack-contrib/css-loader) for available options.
       */
      cssModules: {
        importLoaders: 0,
        url: {
          filter: (url: string, _resourcePath: string) => url[0] !== '/',
        },
        esModule: false,
        modules: {
          localIdentName: '[local]_[hash:base64:5]',
        },
      },

      /**
       * @see [`less-loader` Options](https://github.com/webpack-contrib/less-loader#options)
       */
      less: {},

      /**
       * @see [`sass-loader` Options](https://github.com/webpack-contrib/sass-loader#options)
       */
      sass: {
        sassOptions: {
          indentedSyntax: true,
        },
      },

      /**
       * @see [`sass-loader` Options](https://github.com/webpack-contrib/sass-loader#options)
       */
      scss: {},

      /**
       * @see [`stylus-loader` Options](https://github.com/webpack-contrib/stylus-loader#options)
       */
      stylus: {},

      vueStyle: {},
    },

    /**
     * Add webpack plugins.
     * @example
     * ```js
     * import webpack from 'webpack'
     * import { version } from './package.json'
     * // ...
     * plugins: [
     *   new webpack.DefinePlugin({
     *     'process.VERSION': version
     *   })
     * ]
     * ```
     */
    plugins: [],

    /**
     * Hard-replaces `typeof process`, `typeof window` and `typeof document` to tree-shake bundle.
     */
    aggressiveCodeRemoval: false,

    /**
     * OptimizeCSSAssets plugin options.
     *
     * Defaults to true when `extractCSS` is enabled.
     * @see [css-minimizer-webpack-plugin documentation](https://github.com/webpack-contrib/css-minimizer-webpack-plugin).
     */
    optimizeCSS: {
      $resolve: async (val, get) => {
        if (val === false || (val && typeof val === 'object')) {
          return val
        }
        // @ts-expect-error TODO: remove legacy configuration
        const extractCSS = await get('build.extractCSS')
        return extractCSS ? {} : false
      },
    },

    /**
     * Configure [webpack optimization](https://webpack.js.org/configuration/optimization/).
     */
    optimization: {
      runtimeChunk: 'single',
      /** Set minimize to `false` to disable all minimizers. (It is disabled in development by default). */
      minimize: {
        $resolve: async (val, get) => typeof val === 'boolean' ? val : !(await get('dev')),
      },
      /** You can set minimizer to a customized array of plugins. */
      minimizer: undefined,
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '/',
        cacheGroups: {},
      },
    },

    /**
     * Customize PostCSS Loader.
     * same options as [`postcss-loader` options](https://github.com/webpack-contrib/postcss-loader#options)
     */
    postcss: {
      postcssOptions: {
        plugins: {
          $resolve: async (val, get) => val && typeof val === 'object' ? val : (await get('postcss.plugins')),
        },
      },
    },

    /**
     * See [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) for available options.
     */
    devMiddleware: {
      stats: 'none',
    },

    /**
     * See [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) for available options.
     */
    hotMiddleware: {},

    /**
     * Set to `false` to disable the overlay provided by [FriendlyErrorsWebpackPlugin](https://github.com/nuxt/friendly-errors-webpack-plugin).
     */
    friendlyErrors: true,

    /**
     * Filters to hide build warnings.
     */
    warningIgnoreFilters: [],

    /**
     * Configure [webpack experiments](https://webpack.js.org/configuration/experiments/)
     */
    experiments: {},
  },
})
