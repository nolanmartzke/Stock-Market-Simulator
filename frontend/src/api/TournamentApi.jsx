import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/tournaments",
  headers: {
    'Content-Type': 'application/json',
  },
});

export function createTournament(tournamentData) {
  return api.post("", tournamentData);
}
  
export function getAllTournaments() {
  return api.get("");
}

export function enterTournament(tournamentId, userId) {
  return api.post(`/${tournamentId}/enter`, null, {
    params: { userId },
  });
}

export function getTournamentLeaderboard(tournamentId) {
  return api.get(`/${tournamentId}/leaderboard`);
}

export function getUserTournaments(userId) {
  return api.get(`/user/${userId}`);
}

export default api;
