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
    expect(html).toContain('placeholder="Enter some text…"')
  })
  test('renders all casing labels', async () => {
    const html = await render('App')
    expect(html).toContain('camelCase')
    expect(html).toContain('PascalCase')
    expect(html).toContain('snake_case')
    expect(html).toContain('CONSTANT_CASE')
    expect(html).toContain('kebab-case')
    expect(html).toContain('Train-Case')
    expect(html).toContain('COBOL-CASE')
    expect(html).toContain('lower case')
    expect(html).toContain('UPPER CASE')
    expect(html).toContain('Title Case')
    expect(html).toContain('Sentence case')
  })
  test('renders 11 casing items', async () => {
    const html = await render('App')
    // Each item is an <li> element
    const itemCount = (html.match(/<li/g) ?? []).length
    expect(itemCount).toBe(11)
  })
  test('renders empty results when no text entered', async () => {
    const html = await render('App')
    // All output elements should be empty (no text entered)
    const outputs = html.match(/<output[^>]*><\/output>/g) ?? []
    expect(outputs.length).toBe(11)
  })
})
