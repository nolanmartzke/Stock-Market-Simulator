import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/users',
  headers: {
    'Content-Type': 'application/json',
  },
});


export function signUp(email, password, name) {
  // return Promise, caller then handles response or error, as well as token storage
  return api.post('/signup', { email, password, name });
}

export function signIn(email, password) {
  // return Promise, caller then handles response or error, as well as token storage
  return api.post('/login', { email, password });
}

