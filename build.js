#!/usr/bin/node

const fs = require('fs')

const homedir = require('os').homedir()
// location where mpris.js is located
const nativeScriptPath = process.cwd()
// create intermediate directories w.o. throwing errors
const mkdirOptions = {
  recursive: true
}

// some helper functions to replace string in file(s)
function replaceInFile(file, replacements) {
  fs.readFile(file, (error, data) => {
    if (error) throw error
    data = data.toString()
    for (let replacement of replacements) {
      data = data.replace(replacement[0], replacement[1])
    }
    fs.writeFile(file, data, error => {
      if (error) throw error
    })
  })
}

function prepare(browser) {
  const fontawesomeNpmPath = 'node_modules/@fortawesome/fontawesome-free'
  const fontawesomeTargetPath = 'icons/fontawesome'
  fs.mkdirSync(fontawesomeTargetPath + '/css/', mkdirOptions)
  fs.mkdirSync(fontawesomeTargetPath + '/webfonts/', mkdirOptions)
  fs.copyFileSync(`${fontawesomeNpmPath}/css/all.min.css`,
          `${fontawesomeTargetPath}/css/all.min.css`)
  fs.copyFileSync(`${fontawesomeNpmPath}/webfonts/fa-solid-900.ttf`,
          `${fontawesomeTargetPath}/webfonts/fa-solid-900.ttf`)
  fs.copyFileSync(`${fontawesomeNpmPath}/webfonts/fa-solid-900.woff2`,
          `${fontawesomeTargetPath}/webfonts/fa-solid-900.woff2`)
  fs.copyFileSync(`${fontawesomeNpmPath}/webfonts/fa-solid-900.woff`,
          `${fontawesomeTargetPath}/webfonts/fa-solid-900.woff`)
}

function mpris(browser) {
  let mprisManifestPath = null
  let changes = []
  switch(browser) {
    case 'firefox':
      mprisManifestPath = homedir + '/.mozilla/native-messaging-hosts'
      changes = [
        [/\$\{path\}/g, nativeScriptPath],
        [/\$\{allowed_extension\}/g, 'schmidts_katz@cubimon.org'],
        [/allowed_origins/g, 'allowed_extensions']
      ]
      break
    case 'chromium':
    case 'google-chrome':
      mprisManifestPath = homedir + '/.config/chromium/NativeMessagingHosts'
      changes = [
        [/\$\{path\}/g, nativeScriptPath],
        [/\$\{allowed_extension\}/g,
          'chrome-extension://afjbcphlhomgmdfnhondkjglafgbejdm/'],
        [/allowed_extensions/g, 'allowed_origins']
      ]
      break
  }
  let targetFile = `${mprisManifestPath}/schmidts_katz_mpris.json`
  fs.mkdirSync(mprisManifestPath, mkdirOptions)
  fs.copyFileSync(`mpris.json`, targetFile)
  replaceInFile(targetFile, changes)
}


// argument parsing
let supportedBrowsers = [
  'firefox',
  'chromium',
  'google-chrome'
]
const description = `first argument must be browser: ${supportedBrowsers}`
if (process.argv.length < 3) {
  console.log(description)
  process.exit(1)
}
let browser = process.argv[2]
if (!supportedBrowsers.includes(browser)) {
  console.log(description)
  process.exit(2)
}
prepare(browser)
if (process.platform === 'linux')
  mpris(browser)
