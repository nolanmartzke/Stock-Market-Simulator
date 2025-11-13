import axios from 'axios';

/**
 * Axios client preconfigured for the backend auth routes so every call
 * shares the same base URL and JSON headers.
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api/users',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Registers a new user and returns the axios Promise so callers can
 * decide how to persist tokens and surface errors.
 *
 * @param {string} email - User’s login email.
 * @param {string} password - Plaintext password to send to the API.
 * @param {string} name - Display name for the account profile.
 * @returns {Promise<import("axios").AxiosResponse>} Signup response.
 */
export function signUp(email, password, name) {
  // return Promise, caller then handles response or error, as well as token storage
  return api.post('/signup', { email, password, name });
}

/**
 * Authenticates an existing user against the backend.
 *
 * @param {string} email - User’s login email.
 * @param {string} password - Password supplied on the login form.
 * @returns {Promise<import("axios").AxiosResponse>} Login response.
 */
export function signIn(email, password) {
  // return Promise, caller then handles response or error, as well as token storage
  return api.post('/login', { email, password });
}

