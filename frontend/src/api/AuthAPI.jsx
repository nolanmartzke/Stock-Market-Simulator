import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/users',
  headers: {
    'Content-Type': 'application/json',
  },
});


export function signUp(username, password) {
  // return Promise, caller then handles response or error, as well as token storage
  return api.post('/', { username, password });
}

export function signIn(username, password) {
  // return Promise, caller then handles response or error, as well as token storage
  return api.post('/signin', { username, password });
}

