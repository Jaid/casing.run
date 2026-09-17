import clsx from 'clsx'
import {useState} from 'react'

import {casings} from '#src/lib/casings.ts'

import css from './style.module.sass'

const placeholderText = 'Enter some text'

export default () => {
  const [text, setText] = useState('')
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value)
  }
  const hasText = Boolean(text.trim().length)
  const items = Object.entries(casings).map(([key, casing]) => {
    const value = casing.convert(text)
    const isEqual = value === text.trim()
    return <div key={key} className={clsx(css.item, css[casing.category], hasText && isEqual && css.equal)}>
      <div className={css.header}>
        <span className={css.button}>󱉨</span>
        <span className={css.name}>{casing.id}</span>
      </div>
      <input className={css.result} placeholder={casing.convert(placeholderText)} readOnly type='text' value={value} />
    </div>
  })
  return <>
    <div className={css.inputWrapper}>
      <input className={css.input} autoFocus placeholder={placeholderText} type='text' value={text} onChange={onChange} />
    </div>
    <div className={css.arrow}>
      change casing
    </div>
    <div className={css.arrow}>
      ↓
    </div>
    {items}
  </>
}
