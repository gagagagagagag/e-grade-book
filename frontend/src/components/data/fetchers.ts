import { omitBy, isNil } from 'lodash'
import qs from 'query-string'

import backendAxios from '../../axios-instance'

export const fetchWithQuery = async (url: string, query: object) => {
  const sanitizedQuery = omitBy({ ...query }, isNil)

  const searchParams = qs.stringify(sanitizedQuery, {
    arrayFormat: 'bracket',
  })

  const urlWithSearch = `${url}?${searchParams}`

  const { data } = await backendAxios.get(`${urlWithSearch}`)

  return data
}
