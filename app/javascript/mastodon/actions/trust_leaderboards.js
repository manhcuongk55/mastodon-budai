import api from '../api';
import { importFetchedAccounts } from './importer';

export const TRUST_LEADERBOARD_FETCH_REQUEST = 'TRUST_LEADERBOARD_FETCH_REQUEST';
export const TRUST_LEADERBOARD_FETCH_SUCCESS = 'TRUST_LEADERBOARD_FETCH_SUCCESS';
export const TRUST_LEADERBOARD_FETCH_FAIL    = 'TRUST_LEADERBOARD_FETCH_FAIL';

export function fetchTrustLeaderboard() {
  return (dispatch, getState) => {
    dispatch(fetchTrustLeaderboardRequest());

    api(getState).get('/api/v1/trust_leaderboards')
      .then(response => {
        dispatch(importFetchedAccounts(response.data));
        dispatch(fetchTrustLeaderboardSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchTrustLeaderboardFail(error));
      });
  };
}

export function fetchTrustLeaderboardRequest() {
  return {
    type: TRUST_LEADERBOARD_FETCH_REQUEST,
    skipLoading: true,
  };
}

export function fetchTrustLeaderboardSuccess(accounts) {
  return {
    type: TRUST_LEADERBOARD_FETCH_SUCCESS,
    accounts,
  };
}

export function fetchTrustLeaderboardFail(error) {
  return {
    type: TRUST_LEADERBOARD_FETCH_FAIL,
    error,
  };
}
