import {describe, expect, test} from 'bun:test'

import {camelCase, cobolCase, constantCase, kebabCase, lowerCase, pascalCase, sentenceCase, snakeCase, splitWords, titleCase, trainCase, upperCase} from '#src/lib/casings.ts'

describe('splitWords', () => {
  test('empty string returns single empty token', () => {
    expect(splitWords('')).toEqual([''])
  })
  test('single word', () => {
    expect(splitWords('hello')).toEqual(['hello'])
  })
  test('space separated', () => {
    expect(splitWords('hello world')).toEqual(['hello', 'world'])
  })
  test('camelCase splitting', () => {
    expect(splitWords('helloWorld')).toEqual(['hello', 'World'])
  })
  test('PascalCase splitting', () => {
    expect(splitWords('HelloWorld')).toEqual(['Hello', 'World'])
  })
  test('consecutive uppercase followed by lowercase', () => {
    expect(splitWords('HTTPSCertificate')).toEqual(['HTTPS', 'Certificate'])
  })
  test('snake_case delimiter', () => {
    expect(splitWords('hello_world')).toEqual(['hello', 'world'])
  })
  test('CONSTANT_CASE delimiter', () => {
    expect(splitWords('HELLO_WORLD')).toEqual(['HELLO', 'WORLD'])
  })
  test('kebab-case delimiter', () => {
    expect(splitWords('hello-world')).toEqual(['hello', 'world'])
  })
  test('mixed delimiters', () => {
    expect(splitWords('hello world-foo_bar.baz')).toEqual(['hello', 'world', 'foo', 'bar', 'baz'])
  })
  test('multi-word camelCase', () => {
    expect(splitWords('helloWorldAgain')).toEqual(['hello', 'World', 'Again'])
  })
  test('single uppercase word', () => {
    expect(splitWords('HELLO')).toEqual(['HELLO'])
  })
})
describe('casing conversions', () => {
  const input = 'hello world'
  test('camelCase', () => {
    expect(camelCase(input)).toBe('helloWorld')
  })
  test('PascalCase', () => {
    expect(pascalCase(input)).toBe('HelloWorld')
  })
  test('snake_case', () => {
    expect(snakeCase(input)).toBe('hello_world')
  })
  test('CONSTANT_CASE', () => {
    expect(constantCase(input)).toBe('HELLO_WORLD')
  })
  test('kebab-case', () => {
    expect(kebabCase(input)).toBe('hello-world')
  })
  test('Train-Case', () => {
    expect(trainCase(input)).toBe('Hello-World')
  })
  test('COBOL-CASE', () => {
    expect(cobolCase(input)).toBe('HELLO-WORLD')
  })
  test('lower case', () => {
    expect(lowerCase(input)).toBe('hello world')
  })
  test('UPPER CASE', () => {
    expect(upperCase(input)).toBe('HELLO WORLD')
  })
  test('Title Case', () => {
    expect(titleCase(input)).toBe('Hello World')
  })
  test('Sentence case', () => {
    expect(sentenceCase(input)).toBe('Hello world')
  })
})
describe('roundtrip conversions', () => {
  test('camelCase input → camelCase output', () => {
    expect(camelCase('helloWorld')).toBe('helloWorld')
  })
  test('PascalCase input → PascalCase output', () => {
    expect(pascalCase('HelloWorld')).toBe('HelloWorld')
  })
  test('snake_case input → snake_case output', () => {
    expect(snakeCase('hello_world')).toBe('hello_world')
  })
  test('CONSTANT_CASE input → constantCase output', () => {
    expect(constantCase('HELLO_WORLD')).toBe('HELLO_WORLD')
  })
  test('kebab-case input → kebab-case output', () => {
    expect(kebabCase('hello-world')).toBe('hello-world')
  })
  test('Train-Case input → Train-Case output', () => {
    expect(trainCase('Hello-World')).toBe('Hello-World')
  })
  test('COBOL-CASE input → COBOL-CASE output', () => {
    expect(cobolCase('COBOL-CASE')).toBe('COBOL-CASE')
  })
})
describe('edge cases', () => {
  test('empty input for all casings', () => {
    expect(camelCase('')).toBe('')
    expect(pascalCase('')).toBe('')
    expect(snakeCase('')).toBe('')
    expect(constantCase('')).toBe('')
    expect(kebabCase('')).toBe('')
    expect(trainCase('')).toBe('')
    expect(cobolCase('')).toBe('')
    expect(lowerCase('')).toBe('')
    expect(upperCase('')).toBe('')
    expect(titleCase('')).toBe('')
    expect(sentenceCase('')).toBe('')
  })
  test('single character casing', () => {
    expect(camelCase('a')).toBe('a')
    expect(pascalCase('a')).toBe('A')
    expect(snakeCase('A')).toBe('a')
    expect(constantCase('a')).toBe('A')
    expect(kebabCase('A')).toBe('a')
  })
  test('cross-casing conversion', () => {
    // Input in camelCase, output in snake_case
    expect(snakeCase('helloWorld')).toBe('hello_world')
    // Input in snake_case, output in camelCase
    expect(camelCase('hello_world')).toBe('helloWorld')
    // Input in kebab-case, output in PascalCase
    expect(pascalCase('hello-world')).toBe('HelloWorld')
    // Input in CONSTANT_CASE, output in Title Case
    expect(titleCase('HELLO_WORLD')).toBe('Hello World')
    // Input in Train-Case, output in Sentence case
    expect(sentenceCase('Hello-World')).toBe('Hello world')
  })
  test('multiple words in Title Case', () => {
    expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox')
  })
  test('multiple words in Sentence case', () => {
    expect(sentenceCase('the quick brown fox')).toBe('The quick brown fox')
  })
  test('input with leading/trailing spaces', () => {
    expect(camelCase('  hello world  ')).toBe('helloWorld')
  })
})
