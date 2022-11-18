import { BadRequestException } from '@nestjs/common'
import { QueryBuilder, DEFAULT_ERROR } from './query-builder'

describe('QueryBuilder', () => {
  describe('#constructor', () => {
    const initialQuery = { test: 'test' }

    it('should add initialQuery to the query', () => {
      const queryBuilder = new QueryBuilder(initialQuery)

      expect(queryBuilder.getQuery()).toMatchObject(initialQuery)
    })
  })

  describe('#add', () => {
    const testObject = { test: 'test' }
    const anotherTestObject = { another: 'test2' }
    let queryBuilder = new QueryBuilder()

    beforeEach(() => {
      queryBuilder = new QueryBuilder()
    })

    it('should add object to query if no condition is present', () => {
      queryBuilder.add(testObject)

      expect(queryBuilder.getQuery()).toMatchObject(testObject)
    })

    it('should add object to query if condition is true', () => {
      queryBuilder.add(true && testObject)

      expect(queryBuilder.getQuery()).toMatchObject(testObject)
    })

    it('should not add object to query if condition is false', () => {
      queryBuilder.add(false && testObject)

      expect(queryBuilder.getQuery()).toMatchObject({})
    })

    it('should not add to query if param is not an object', () => {
      queryBuilder.add('string')

      expect(queryBuilder.getQuery()).toMatchObject({})
    })

    it('should overwrite previous value', () => {
      queryBuilder.add(testObject)

      expect(queryBuilder.getQuery()).toMatchObject(testObject)

      queryBuilder.add({ test: 'overwrite' })

      const finalQuery = queryBuilder.getQuery()
      expect(finalQuery).not.toMatchObject(testObject)
      expect(finalQuery).toMatchObject({ test: 'overwrite' })
      expect(Object.keys(finalQuery).length).toBe(1)
    })

    it('should add multiple objects to query', () => {
      queryBuilder.add(testObject, true && anotherTestObject)

      expect(queryBuilder.getQuery()).toMatchObject({
        ...testObject,
        ...anotherTestObject,
      })
    })
  })

  describe('#throwErrors', () => {
    let queryBuilder = new QueryBuilder()

    beforeEach(() => {
      queryBuilder = new QueryBuilder()
    })

    it('should throw if condition is true', () => {
      expect(() => queryBuilder.throwErrors(true)).toThrow(
        new BadRequestException(DEFAULT_ERROR)
      )
    })

    it('should throw error with custom message if provided', () => {
      const customError = 'customError'
      expect(() => queryBuilder.throwErrors(true && customError)).toThrow(
        new BadRequestException(customError)
      )
    })

    it('should not throw if condition is false', () => {
      expect(() => queryBuilder.throwErrors(false)).not.toThrow()
    })

    it('should check multiple conditions', () => {
      expect(() => queryBuilder.throwErrors(false, false)).not.toThrow()
    })

    it('should throw if one of the conditions is true', () => {
      expect(() => queryBuilder.throwErrors(false, false, true)).toThrow()
    })
  })
})
