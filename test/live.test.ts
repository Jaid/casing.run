import type {Browser, Page} from 'puppeteer-core'

import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test} from 'bun:test'

import countPixels from 'count-in-png'
import puppeteer from 'puppeteer-core'

import screenshot from './lib/screenshot.ts'
import ViteSession from './lib/ViteSession.ts'

const browserHookTimeout = 30_000
describe.if(Boolean(Bun.env.target)).each(['chrome', 'firefox'])('%s', host => {
  let vite: ViteSession
  let page: Page
  let browser: Browser
  beforeAll(async () => {
    vite = new ViteSession({
      root: Bun.env.target,
    })
    await vite.init()
    browser = await puppeteer.launch({
      browser: host,
      executablePath: Bun.which(host)!,
      defaultViewport: {
        width: 1920,
        height: 960,
      },
      args: host === 'chrome' ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-font-antialiasing',
        '--font-render-hinting=medium',
        '--flag-switches-begin',
        '--enable-experimental-web-platform-features',
        '--enable-features=JXLImageFormat,OverlayScrollbar',
        '--flag-switches-end',
      ] : undefined,
    })
  }, browserHookTimeout)
  afterAll(async () => {
    await vite?.[Symbol.asyncDispose]()
    await browser?.close()
  }, browserHookTimeout)
  beforeEach(async () => {
    page = await browser.newPage()
    if (host === 'chrome') {
      const client = await page.createCDPSession()
      await client.send('Storage.clearDataForOrigin', {
        origin: new URL(vite.url).origin,
        storageTypes: 'all',
      })
      await client.detach()
    }
    await page.goto(vite.url, {waitUntil: 'domcontentloaded'})
    await page.waitForSelector('body>div>*')
  }, browserHookTimeout)
  afterEach(async () => {
    await page?.close()
  }, browserHookTimeout)
  test('static HTML after React render', async () => {
    const html = await page.content()
    await Bun.write('out/test/render.html', html)
    expect(html).toContain('<input')
    expect(html).toContain('placeholder="Enter some text"')
    for (const label of ['camel', 'pascal', 'snake', 'constant', 'kebab', 'train', 'cobol', 'lower', 'sentence', 'title', 'upper']) {
      expect(html).toContain(`>${label}</span>`)
    }
  })
  test('page title is set', async () => {
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })
  test('input field accepts text and updates results', async () => {
    const inputSelector = 'input[type="text"]:not([readonly])'
    await page.waitForSelector(inputSelector)
    await page.focus(inputSelector)
    await page.evaluate(sel => {
      (document.querySelector(sel) as HTMLInputElement).select()
    }, inputSelector)
    await page.type(inputSelector, 'hello world')
    await page.waitForFunction(() => {
      const first = document.querySelector<HTMLInputElement>('input[readonly]')
      return first?.value === 'helloWorld'
    })
    const values = await page.$$eval('input[readonly]', elements => elements.map(element => element.value))
    expect(values).toEqual([
      'helloWorld',
      'HelloWorld',
      'hello_world',
      'HELLO_WORLD',
      'hello-world',
      'Hello-World',
      'HELLO-WORLD',
      'hello world',
      'Hello world',
      'Hello World',
      'HELLO WORLD',
    ])
  })
  test('casings update live as user types', async () => {
    const inputSelector = 'input[type="text"]:not([readonly])'
    await page.waitForSelector(inputSelector)
    await page.focus(inputSelector)
    await page.evaluate(sel => {
      (document.querySelector(sel) as HTMLInputElement).select()
    }, inputSelector)
    await page.type(inputSelector, 'foo')
    await page.waitForFunction(() => document.querySelector<HTMLInputElement>('input[readonly]')?.value === 'foo')
    await page.type(inputSelector, ' bar')
    await page.waitForFunction(() => document.querySelector<HTMLInputElement>('input[readonly]')?.value === 'fooBar')
    const values = await page.$$eval('input[readonly]', elements => elements.map(element => element.value))
    expect(values).toContain('fooBar')
    expect(values).toContain('FooBar')
    expect(values).toContain('foo_bar')
  })
  test('11 casing items rendered', async () => {
    const count = await page.evaluate(() => document.querySelectorAll('input[readonly]').length)
    expect(count).toBe(11)
  })
  if (host === 'chrome') {
    describe.each(['page', 'content'])('%s screenshot', scope => {
      test.each(['dark', 'light'])('%s', async theme => {
        const image = await screenshot(page, {
          colorScheme: theme,
          element: scope === 'content' ? 'body>div' : undefined,
        })
        await Bun.write(`out/test/screenshots/${host}_${theme}_${scope}.png`, image)
        const pixels = countPixels(image)
        if (scope === 'page') {
          const target = theme === 'dark' ? '000000FF' : 'FFFFFFFF'
          const hits = countPixels(image, target)
          expect(hits).toBeWithin(0.5 * pixels, 0.999 * pixels)
        } else {
          expect(pixels).toBeGreaterThan(100)
        }
      })
    })
  }
})
