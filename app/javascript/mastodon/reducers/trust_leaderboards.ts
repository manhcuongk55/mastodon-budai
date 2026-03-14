import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable';

import {
  TRUST_LEADERBOARD_FETCH_REQUEST,
  TRUST_LEADERBOARD_FETCH_SUCCESS,
  TRUST_LEADERBOARD_FETCH_FAIL,
} from '../actions/trust_leaderboards';

const initialState = ImmutableMap({
  items: ImmutableList(),
  isLoading: false,
});

interface TrustLeaderboardAction {
  type: string;
  accounts?: { id: string }[];
  error?: unknown;
}

export const trustLeaderboardsReducer = (state = initialState, action: TrustLeaderboardAction) => {
  switch (action.type) {
    case TRUST_LEADERBOARD_FETCH_REQUEST:
      return state.set('isLoading', true);
    case TRUST_LEADERBOARD_FETCH_SUCCESS:
      return state.withMutations((map: typeof state) => {
        if (action.accounts) {
          map.set('items', fromJS(action.accounts.map((a) => a.id)));
        }
        map.set('isLoading', false);
      });
    case TRUST_LEADERBOARD_FETCH_FAIL:
      return state.set('isLoading', false);
    default:
      return state;
  }
};
