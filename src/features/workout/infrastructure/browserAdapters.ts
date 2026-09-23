import type { DateProvider, IdGenerator } from '../application/ports'

export const browserDateProvider: DateProvider = {
  today: () => new Date().toISOString().slice(0, 10),
}

export const browserIdGenerator: IdGenerator = {
  generate: () => crypto.randomUUID(),
}
