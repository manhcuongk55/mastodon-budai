import type { Reducer } from '@reduxjs/toolkit';
import { Map as ImmutableMap } from 'immutable';

import {
  followAccountSuccess,
  unfollowAccountSuccess,
  revealAccount,
} from 'mastodon/actions/accounts_typed';
import { importAccounts } from 'mastodon/actions/importer/accounts';
import type { ApiAccountJSON } from 'mastodon/api_types/accounts';
import { me } from 'mastodon/initial_state';
import type { Account } from 'mastodon/models/account';
import { createAccountFromServerJSON } from 'mastodon/models/account';

const initialState = ImmutableMap<string, Account>();

const normalizeAccount = (
  state: typeof initialState,
  account: ApiAccountJSON,
) => {
  return state.set(
    account.id,
    createAccountFromServerJSON(account).set(
      'hidden',
      state.get(account.id)?.hidden === false
        ? false
        : account.limited || false,
    ),
  );
};

const normalizeAccounts = (
  state: typeof initialState,
  accounts: ApiAccountJSON[],
) => {
  accounts.forEach((account) => {
    state = normalizeAccount(state, account);
  });

  return state;
};

function getCurrentUser() {
  if (!me)
    throw new Error(
      'No current user (me) defined when calling `accountsReducer`',
    );

  return me;
}

export const accountsReducer: Reducer<typeof initialState> = (
  state = initialState,
  action,
) => {
  if (revealAccount.match(action))
    return state.setIn([action.payload.id, 'hidden'], false);
  else if (importAccounts.match(action))
    return normalizeAccounts(state, action.payload.accounts);
  else if (
    followAccountSuccess.match(action) &&
    !action.payload.alreadyFollowing
  ) {
    return state
      .update(action.payload.relationship.id, (account) =>
        account?.update('followers_count', (n) => n + 1),
      )
      .update(getCurrentUser(), (account) =>
        account?.update('following_count', (n) => n + 1),
      );
  } else if (unfollowAccountSuccess.match(action)) {
    return state
      .update(action.payload.relationship.id, (account) =>
        account?.update('followers_count', (n) => Math.max(0, n - 1)),
      )
      .update(getCurrentUser(), (account) =>
        account?.update('following_count', (n) => Math.max(0, n - 1)),
      );
  } else if ((action as any).type === 'ACCOUNT_TRUTH_BERRIES_INCREMENT') {
    const act = action as any;
    // @ts-ignore
    return state.update(act.accountId as string, (account) =>
      account?.update('truth_berries' as keyof AccountShape, (n) => ((n as number) || 0) + (act.amount as number)),
    );
  } else if ((action as any).type === 'ACCOUNT_TRUTH_BERRIES_DECREMENT') {
    const act = action as any;
    // @ts-ignore
    return state.update(act.accountId as string, (account) =>
      account?.update('truth_berries' as keyof AccountShape, (n) => Math.max(0, ((n as number) || 0) - (act.amount as number))),
    );
  } else {
    return state;
  }
};
