import { omitBy, isNil } from 'lodash'

import backendAxios from '../../axios-instance'

export const fetchWithQuery = async (url: string, query: object) => {
  const sanitizedQuery = omitBy({ ...query }, isNil)

  const searchParams = new URLSearchParams(sanitizedQuery)

  const urlWithSearch = `${url}?${searchParams}`

  const { data } = await backendAxios.get(`${urlWithSearch}`)

  return data
}
