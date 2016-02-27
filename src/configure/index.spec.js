import { join } from 'path'
import { expect } from 'chai'
import { HotModuleReplacementPlugin, optimize } from 'webpack'
import configure from './index'

const saguiPath = join(__dirname, '../../')
const projectPath = join(saguiPath, 'spec/fixtures/simple-project')

describe('configure', function () {
  let config

  describe('loaders', function () {
    beforeEach(function () {
      config = configure({ projectPath, saguiPath }).webpackConfig
    })

    it('should have a JSON loader', function () {
      const loader = config.module.loaders.find(loader => loader.loader === 'json-loader')
      expect(loader.test).eql(/\.(json)$/)
    })
  })

  describe('disabling plugins', function () {
    beforeEach(function () {
      const disabledPlugins = ['webpack-json']
      config = configure({ projectPath, saguiPath, disabledPlugins }).webpackConfig
    })

    it('should disable the specified plugins', function () {
      const loader = config.module.loaders.find(loader => loader.loader === 'json-loader')
      expect(loader).eql(undefined)
    })
  })

  describe('webpackConfig extension', function () {
    it('should allow extending the default configuration', function () {
      const webpackConfig = {
        target: 'electron'
      }

      config = configure({ projectPath, saguiPath, webpackConfig }).webpackConfig

      expect(config.target).equal('electron')
    })

    it('should allow overwriting the default configuration', function () {
      const defaultConfig = configure({ projectPath, saguiPath, webpackConfig }).webpackConfig
      expect(defaultConfig.devtool).equal('source-map')

      const webpackConfig = {
        devtool: 'cheap-source-map'
      }

      config = configure({ projectPath, saguiPath, webpackConfig }).webpackConfig
      expect(config.devtool).equal('cheap-source-map')
    })

    it('should allow changing a loader based on the test (webpack-merge feature)', function () {
      // disable the default exclude behavior of Babel
      const webpackConfig = {
        module: {
          loaders: [
            {
              test: /\.jsx?$/,
              loader: 'babel'
            }
          ]
        }
      }

      config = configure({ projectPath, saguiPath, webpackConfig }).webpackConfig
      const loaders = config.module.loaders.filter((loader) => loader.loader === 'babel')

      // should change the existing loader, not add another
      expect(loaders.length).equal(1)

      // should remove the exclude attribute as requested
      expect(loaders[0].exclude).undefined
    })
  })

  describe('karmaConfig extension', function () {
    it('should allow overwriting the default configuration', function () {
      const defaultConfig = configure({ projectPath, saguiPath, karmaConfig }).karmaConfig
      expect(defaultConfig.browsers).deep.eql(['PhantomJS'])

      const karmaConfig = {
        browsers: ['Chrome']
      }

      config = configure({ projectPath, saguiPath, karmaConfig }).karmaConfig
      expect(config.browsers).deep.eql(['Chrome'])
    })
  })

  describe('targets', function () {
    // see: https://github.com/webpack/karma-webpack/issues/24
    it('should not have the CommonsChunkPlugin enabled while testing', function () {
      config = configure({ projectPath, saguiPath, buildTarget: 'test' }).webpackConfig

      const commons = config.plugins.filter(plugin => plugin instanceof optimize.CommonsChunkPlugin)
      expect(commons.length).equal(0)
    })

    it('should have the CommonsChunkPlugin enabled while not testing', function () {
      config = configure({ projectPath, saguiPath, buildTarget: 'develop' }).webpackConfig

      const commons = config.plugins.filter(plugin => plugin instanceof optimize.CommonsChunkPlugin)
      expect(commons.length).equal(1)
    })

    it('should have the UglifyJsPlugin enabled while distributing', function () {
      config = configure({ projectPath, saguiPath, buildTarget: 'dist' }).webpackConfig

      const commons = config.plugins.filter(plugin => plugin instanceof optimize.UglifyJsPlugin)
      expect(commons.length).equal(1)
    })

    it('should have the HotModuleReplacementPlugin enabled while developing', function () {
      config = configure({ projectPath, saguiPath, buildTarget: 'develop' }).webpackConfig

      const commons = config.plugins.filter(plugin => plugin instanceof HotModuleReplacementPlugin)
      expect(commons.length).equal(1)
    })
  })
})
