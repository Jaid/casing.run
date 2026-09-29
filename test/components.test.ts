import {describe, expect, test} from 'bun:test'

import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

import testSassModulesPlugin from './lib/sassModulesPlugin.ts'

Bun.plugin(testSassModulesPlugin)
async function render(componentSegment: string, props?: Record<string, unknown>) {
  const Component = (await import(`#src/components/${componentSegment}/index.tsx`)).default
  const element = createElement(Component, props)
  return renderToStaticMarkup(element)
}
describe('App component', () => {
  test('renders input field', async () => {
    const html = await render('App')
    expect(html).toContain('<input')
    expect(html).toContain('placeholder="Enter some text"')
  })
  test('renders all casing labels', async () => {
    const html = await render('App')
    for (const label of ['camel', 'pascal', 'snake', 'constant', 'kebab', 'train', 'cobol', 'lower', 'sentence', 'title', 'upper']) {
      expect(html).toContain(`<span class="name">${label}</span>`)
    }
  })
  test('renders 11 casing items', async () => {
    const html = await render('App')
    const itemCount = (html.match(/<div class="item /g) ?? []).length
    expect(itemCount).toBe(11)
  })
  test('renders empty results when no text entered', async () => {
    const html = await render('App')
    const results = html.match(/<input class="result"[^>]*value=""/g) ?? []
    expect(results.length).toBe(11)
  })
})
