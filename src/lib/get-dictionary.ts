import 'server-only' 

import type { default as DictionaryType } from '../dictionaries/pt.json'

export type Dictionary = typeof DictionaryType

const dictionaries = {
  pt: () => import('../dictionaries/pt.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()