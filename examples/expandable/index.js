/* eslint-env es6 */

const html = require('bel')
const raw = require('bel/raw')
const morph = require('nanomorph')
const MarkdownIt = require('markdown-it')
const component = require('fun-component')
const restate = require('fun-component/restate')
const spawn = require('fun-component/spawn')

const parser = new MarkdownIt()

const DEFAULT_TEXT = `# Stateful Example – fun-component

This is an example illustrating how to work with multiple stateful components using [fun-component](https://github.com/tornqvist/fun-component), a performant component encapsulated as a function.`

/**
 * Create base exapandable component
 */

const expandable = component(function expandable (ctx, id, text) {
  const toggle = () => ctx.restate({expanded: !ctx.state.expanded})

  return html`
    <div>
      <button class="Button Button--invert" onclick=${toggle}>
        ${ctx.state.expanded ? 'Hide' : 'Show'} preview
      </button>
      <div class="Output" style="display: ${ctx.state.expanded ? 'block' : 'none'};">
        ${raw(parser.render(text))}
      </div>
    </div>
  `
})

/**
 * Use first argument as key for context
 */

expandable.use(spawn(id => id))

/**
 * Default expandables to be collapsed
 */

expandable.use(restate({ expanded: false }))

/**
 * Create a base textarea component
 */

const input = component(function input (ctx, id, text, oninput) {
  const textarea = html`<textarea class="Text" rows="12" oninput=${oninput}></textarea>`
  textarea.value = text // Needed to preserve linebreaks
  return textarea
})

/**
 * Use first argument as key for context
 */

input.use(spawn(id => id))

/**
 * Start application
 */

const state = {'welcome-01': DEFAULT_TEXT}
morph(document.body, view(state))

function update (next) {
  morph(document.body, view(Object.assign(state, next)))
}

function view (state) {
  return html`
    <body class="App">
      <div class="App-container">
        ${Object.keys(state).map(id => html`
          <div>
            <div class="Header">
              <h2 class="Header-title">File #${id}</h2>
              <button class="Button Button--inline" onclick=${remove(id)}>Remove file</button>
            </div>
            ${input(id, state[id] || '', oninput(id))}
            ${expandable(id, state[id] || 'Nothing here')}
          </div>
        `)}
      </div>
      <button class="Button" onclick=${add}>Add file</button>
    </body>
  `

  function remove (id) {
    return function () {
      delete state[id]
      update()
    }
  }

  function add () {
    update({ [makeID()]: '' })
  }

  function oninput (id) {
    return event => {
      const value = event.target.value
      update({ [id]: value })
    }
  }
}

function makeID () {
  return 'id-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}
