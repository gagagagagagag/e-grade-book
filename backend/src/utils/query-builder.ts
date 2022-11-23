import { BadRequestException } from '@nestjs/common'

export const DEFAULT_ERROR = 'Podane wartości nie są poprawne'

export class QueryBuilder {
  private query: object

  constructor(initQuery?: object) {
    this.query = initQuery ? initQuery : {}
  }

  add(...queryAddition: any[]) {
    for (const addition of queryAddition) {
      if (!addition || typeof addition !== 'object') {
        continue
      }
      this.query = {
        ...this.query,
        ...addition,
      }
    }

    return this
  }

  throwErrors(...errorChecks: any[]) {
    for (const errorCheck of errorChecks) {
      if (
        !errorCheck ||
        (typeof errorCheck !== 'string' && errorCheck !== true)
      ) {
        continue
      }

      throw new BadRequestException(
        typeof errorCheck === 'string' ? errorCheck : DEFAULT_ERROR
      )
    }
  }

  getQuery() {
    return this.query
  }
}
