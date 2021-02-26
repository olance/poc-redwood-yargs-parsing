#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const SCOPE_TOKEN = '+'
const SCOPE_VALUE_SEPARATOR = ':'

function processArgs(argv) {
  console.log("Input argv:", argv)

  let args = argv.reverse()
  let currentScope = null
  let newArgs = []

  while (args.length > 0) {
    let arg = args.pop()

    // Beginning a new scope?
    if (arg[0] === SCOPE_TOKEN) {
      // Extract scope name.
      // That would be 'deploy' for '+deploy:netlify' and 'tailwind' for '+tailwind'
      // TODO: should we handle multi-level scopes, i.e. +deploy:gcp:cloud-run / +deploy:gcp:appengine? (seems unlikely)
      const scopeComponents = arg.substr(1).split(SCOPE_VALUE_SEPARATOR)
      currentScope = scopeComponents[0]

      // If it's a "parameterized" scope ('+deploy:netlify') we need to issue an arg for the scope value
      if (scopeComponents.length === 2) {
        newArgs.push(`--${currentScope}=${scopeComponents[1]}`)
      }

      continue
    }

    // Down here means we're _within_ a scope, possibly null (global scope)
    const argName = arg.substr(2) // Assuming args always start with '--'
    let newArg = '--'

    if (currentScope !== null) {
      newArg += `${currentScope}.`
    }

    // We now have newArg ==
    // -> '--force' for a global '--force' flag
    // -> '--tailwind.ui' for something like '+tailwind --ui'
    // -> '--i18n.lang=en,fr' for something like '+i18n --lang=en,fr'
    newArg += argName

    // If the arg needs a value and it's been passed like '--lang en,fr' it's not covered by the above, we need to look
    // ahead and consume the next arg if needed
    const nextArg = args[args.length - 1]
    if (argName.indexOf('=') < 0 && nextArg[0] !== SCOPE_TOKEN && nextArg.substr(0, 2) !== '--') {
      newArg += `=${args.pop()}`
    }

    newArgs.push(newArg)
  }

  console.log('Transformed argv:', newArgs)

  return newArgs
}

const argv = yargs(processArgs(hideBin(process.argv))).argv

console.log("Final argv:", argv)