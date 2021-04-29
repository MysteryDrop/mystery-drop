import { env } from '../config'

export function apiRequest({path, method = 'GET', data, accessToken}) {
  // todo store access token in local storage
  // check if jwt is valid
  // if missing auth token redirect user to authenticate again
  return fetch(`${env.baseURL}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.json())
}

export function raribleApiRequest({path, method = 'GET', data, accessToken}) {
  // todo store access token in local storage
  // check if jwt is valid
  // if missing auth token redirect user to authenticate again
  return fetch(`${env.raribleBaseUrl}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.json())
}
