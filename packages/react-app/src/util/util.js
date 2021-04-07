import { env } from '../config'

export function apiRequest({path, method = 'GET', data, accessToken}) {
  return fetch(`${env.baseURL}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.json())
}
