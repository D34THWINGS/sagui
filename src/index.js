import parentModule from 'parent-module'
import path from 'path'
import karma from './karma'
import webpack from './webpack'
import bootstrap from './bootstrap'
import cli from './cli'

export default function sagui ({
  buildTarget = normalize(process.env.NODE_ENV),
  projectPath = path.dirname(parentModule()),
  saguiPath = path.join(__dirname, '..')
} = {}) {
  return {
    karma: karma({ projectPath }),
    webpack: webpack({ buildTarget, projectPath, saguiPath }),
    bootstrap: bootstrap({ projectPath })
  }
}

/**
 * Exposes the Command Line Interface API
 */
sagui.cli = cli

const normalize = (env = 'development') => env.toLowerCase().trim()
