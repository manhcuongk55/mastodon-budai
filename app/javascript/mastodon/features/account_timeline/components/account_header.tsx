import React, { useCallback, useState, useEffect } from 'react';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';

import { openModal } from '@/mastodon/actions/modal';
import { AccountBio } from '@/mastodon/components/account_bio';
import { Avatar } from '@/mastodon/components/avatar';
import { AnimateEmojiProvider } from '@/mastodon/components/emoji/context';
import { AccountNote } from '@/mastodon/features/account/components/account_note';
import FollowRequestNoteContainer from '@/mastodon/features/account/containers/follow_request_note_container';
import { useLayout } from '@/mastodon/hooks/useLayout';
import { useVisibility } from '@/mastodon/hooks/useVisibility';
import { useIdentity } from '@/mastodon/identity_context';
import { p2pTrust } from '@/mastodon/services/p2p_trust_service';
import {
  autoPlayGif,
  me,
  domain as localDomain,
} from '@/mastodon/initial_state';
import type { Account } from '@/mastodon/models/account';
import { getAccountHidden } from '@/mastodon/selectors/accounts';
import { useAppSelector, useAppDispatch } from '@/mastodon/store';

import { isRedesignEnabled } from '../common';

import { AccountName } from './account_name';
import { submitIdentityVerification } from '@/mastodon/actions/accounts';
import { AccountBadges } from './badges';
import { AccountButtons } from './buttons';
import { FamiliarFollowers } from './familiar_followers';
import { AccountHeaderFields } from './fields';
import { AccountInfo } from './info';
import { MemorialNote } from './memorial_note';
import { MovedNote } from './moved_note';
import { AccountNote as AccountNoteRedesign } from './note';
import { AccountNumberFields } from './number_fields';
import { P2PTrustBadge } from './p2p_trust_badge';
import redesignClasses from './redesign.module.scss';
import { AccountTabs } from './tabs';
import FaceVerification from '@/mastodon/features/account/components/face_verification';

const titleFromAccount = (account: Account) => {
  const displayName = account.display_name;
  const acct =
    account.acct === account.username
      ? `${account.username}@${localDomain}`
      : account.acct;
  const prefix =
    displayName.trim().length === 0 ? account.username : displayName;

  return `${prefix} (@${acct})`;
};

export const AccountHeader: React.FC<{
  accountId: string;
  hideTabs?: boolean;
}> = ({ accountId, hideTabs }) => {
  const isRedesign = isRedesignEnabled();

  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.get(accountId));
  const relationship = useAppSelector((state) =>
    state.relationships.get(accountId),
  );
  const hidden = useAppSelector((state) => getAccountHidden(state, accountId));

  const identity = useIdentity();
  const [myVouches, setMyVouches] = useState<string[]>([]);

  // Epic U: Guardian Check - Subscribe to MY trust score to see if I am a Guardian
  useEffect(() => {
    if (!identity.accountId) return;
    const unsubscribe = p2pTrust.subscribeToVouches(identity.accountId, (newVouches: string[]) => {
      setMyVouches(newVouches);
    });
    return () => unsubscribe();
  }, [identity.accountId]);

  const isGuardian = myVouches.length >= 3;

  const [showFaceVerification, setShowFaceVerification] = useState(false);

  const handleFaceVerificationComplete = useCallback((payload: { nodeId: string; proofHash: string }) => {
    setShowFaceVerification(false);
    // Submit to Guardians via Zero Knowledge
    dispatch(submitIdentityVerification());
    alert(`🔐 Zero-Knowledge Biometric Proof generated successfully!\nNode ID: ${payload.nodeId}\nHash: ${payload.proofHash}\n\nĐã gửi Hồ sơ Mã hoá ẩn danh (Anonymous Encrypted Dossier) đến Hội đồng Guardian P2P để thẩm định! Yêu cầu xác thực của bạn đang được xử lý.`);
  }, [dispatch]);

  const handleOpenAvatar = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey) {
        return;
      }

      e.preventDefault();

      if (!account) {
        return;
      }

      dispatch(
        openModal({
          modalType: 'IMAGE',
          modalProps: {
            src: account.avatar,
            alt: '',
          },
        }),
      );
    },
    [dispatch, account],
  );

  const { layout } = useLayout();
  const { observedRef, isIntersecting } = useVisibility({
    observerOptions: {
      rootMargin: layout === 'mobile' ? '0px 0px -55px 0px' : '', // Height of bottom nav bar.
    },
  });

  if (!account) {
    return null;
  }

  const suspendedOrHidden = hidden || account.suspended;
  const isLocal = !account.acct.includes('@');
  const isMe = me && account.id === me;

  return (
    <div className='account-timeline__header'>
      {!hidden && account.memorial && <MemorialNote />}
      {!hidden && account.moved && (
        <MovedNote accountId={account.id} targetAccountId={account.moved} />
      )}

      <AnimateEmojiProvider
        className={classNames('account__header', {
          inactive: !!account.moved,
        })}
      >
        {!suspendedOrHidden && !account.moved && relationship?.requested_by && (
          <FollowRequestNoteContainer account={account} />
        )}

        <div
          className={classNames(
            'account__header__image',
            isRedesign && redesignClasses.header,
          )}
        >
          {me !== account.id && relationship && !isRedesign && (
            <AccountInfo relationship={relationship} />
          )}

          {!suspendedOrHidden && (
            <img
              src={autoPlayGif ? account.header : account.header_static}
              alt=''
              className='parallax'
            />
          )}
        </div>

        <div
          className={classNames(
            'account__header__bar',
            isRedesign && redesignClasses.barWrapper,
          )}
        >
          <div
            className={classNames(
              'account__header__tabs',
              isRedesign && redesignClasses.avatarWrapper,
            )}
          >
            <a
              className='avatar'
              href={account.avatar}
              rel='noopener'
              target='_blank'
              onClick={handleOpenAvatar}
            >
              <Avatar
                account={suspendedOrHidden ? undefined : account}
                size={isRedesign ? 80 : 92}
              />
            </a>

            {!isRedesign && (
              <AccountButtons
                accountId={accountId}
                className='account__header__buttons--desktop'
              />
            )}
          </div>

          <div
            className={classNames(
              'account__header__tabs__name',
              isRedesign && redesignClasses.nameWrapper,
            )}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AccountName accountId={accountId} />
                {typeof account.truth_berries !== 'undefined' && (
                  <div 
                    className="truth-berries-badge" 
                    title={`${account.truth_berries} Truth Berries`}
                    style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '20px', color: '#4ADE80', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', boxShadow: '0 0 10px rgba(74, 222, 128, 0.2)' }}
                  >
                    🫐 {account.truth_berries}
                  </div>
                )}
              </div>
              <P2PTrustBadge targetAccountId={accountId} targetUsername={account.acct} />
              
              {account.is_seeking_verification && !isMe && (
                <div style={{ marginTop: '4px', background: 'rgba(255, 172, 51, 0.1)', border: '1px solid #ffac33', borderRadius: '4px', padding: '8px 12px', color: '#ffac33', fontSize: '13px', fontWeight: 'bold' }}>
                  <span style={{ display: 'block', marginBottom: '4px' }}>🛡️ Cần Hành Động: Đang Xác Thực Tính Danh</span>
                  <span style={{ fontSize: '12px', color: '#8899a6', fontWeight: 'normal' }}>Người dùng này đang yêu cầu Cộng đồng Guardian xác minh họ là Người Thật.</span>
                  
                  {isGuardian ? (
                    <button 
                      type="button" 
                      className="button button-secondary" 
                      style={{ width: '100%', marginTop: '8px', padding: '4px', fontSize: '12px', background: '#ffac33', borderColor: '#ffac33', color: '#15202b' }}
                      onClick={() => { 
                        alert(`[GUARDIAN ACCESS GRANTED]\n\nMở Hồ Sơ Mã Hoá của Node: ${accountId}\n\nĐang tiến hành giải mã thuật toán phân mảnh khuôn mặt (Zero-Knowledge Sync)...`);
                      }}
                    >
                      Mở Hồ Sơ Bằng Chứng (Zero-Knowledge)
                    </button>
                  ) : (
                    <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', textAlign: 'center', color: '#8899a6', fontSize: '11px' }}>
                      🔒 Chỉ dành cho [Guardian] (Cần 3+ Vouch để mở khóa Hồ sơ này). Bạn hiện có {myVouches.length} Vouch.
                    </div>
                  )}
                </div>
              )}

              {isMe && !suspendedOrHidden && (
                <button 
                  type="button"
                  className='button button-tertiary' 
                  style={{ marginTop: '8px', background: 'rgba(29, 161, 242, 0.1)', color: '#1da1f2', border: '1px solid #1da1f2', padding: '4px 10px', fontSize: '13px', borderRadius: '4px', width: 'fit-content', fontWeight: 'bold' }}
                  onClick={() => { setShowFaceVerification(true); }}
                >
                  👁️ Xác Thực Danh Tính (Face Verify)
                </button>
              )}
            </div>
            {isRedesign && (
              <AccountButtons
                accountId={accountId}
                className={redesignClasses.buttonsDesktop}
                noShare={!isMe || 'share' in navigator}
                forceMenu={'share' in navigator}
              />
            )}
          </div>

          <AccountBadges accountId={accountId} />

          {!isMe && !suspendedOrHidden && (
            <FamiliarFollowers accountId={accountId} />
          )}

          {!isRedesign && (
            <AccountButtons
              className='account__header__buttons--mobile'
              accountId={accountId}
              noShare
            />
          )}

          {!suspendedOrHidden && (
            <div className='account__header__extra'>
              <div className='account__header__bio'>
                {me &&
                  account.id !== me &&
                  (isRedesign ? (
                    <AccountNoteRedesign accountId={accountId} />
                  ) : (
                    <AccountNote accountId={accountId} />
                  ))}

                <AccountBio
                  accountId={accountId}
                  className={classNames(
                    'account__header__content',
                    isRedesign && redesignClasses.bio,
                  )}
                />
                <AccountHeaderFields accountId={accountId} />
              </div>

              <AccountNumberFields accountId={accountId} />
            </div>
          )}

          {isRedesign && (
            <AccountButtons
              className={classNames(
                redesignClasses.buttonsMobile,
                !isIntersecting && redesignClasses.buttonsMobileIsStuck,
              )}
              accountId={accountId}
              noShare
            />
          )}
        </div>
      </AnimateEmojiProvider>

      {!hideTabs && !hidden && <AccountTabs acct={account.acct} />}
      <div ref={observedRef} />

      <Helmet>
        <title>{titleFromAccount(account)}</title>
        <meta
          name='robots'
          content={isLocal && !account.noindex ? 'all' : 'noindex'}
        />
        <link rel='canonical' href={account.url} />
      </Helmet>

      {/* Epic S: Proof of Personhood Full Screen Modal */}
      {showFaceVerification && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaceVerification 
            onCancel={() => { setShowFaceVerification(false); }} 
            onVerificationComplete={handleFaceVerificationComplete} 
          />
        </div>
      )}
    </div>
  );
};
