import React, { PureComponent, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { p2pFeed } from 'mastodon/services/p2p_feed_service';
import GlobeIcon from '@/material-icons/400-24px/language.svg?react';
import { Avatar } from 'mastodon/components/avatar';
import { RelativeTimestamp } from 'mastodon/components/relative_timestamp';

const messages = defineMessages({
  title: { id: 'column.p2p', defaultMessage: 'P2P Off-Grid' },
});

// A lightweight status component optimized for P2P payloads (no Redux dependency)
const P2PStatus = ({ post }) => {
  // Construct a dummy account for the Avatar component
  const account = {
    id: post.account_id,
    username: post.account_username,
    acct: post.account_username,
    display_name: post.account_display_name,
    avatar: post.account_avatar,
    avatar_static: post.account_avatar,
  };

  return (
    <div className="status light" style={{ padding: '15px', borderBottom: '1px solid var(--background-border-color)' }}>
      <div className="status__info" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
        <a href={`/@${account.acct}`} className="status__avatar" style={{ marginRight: '10px' }}>
          <Avatar account={account} size={46} />
        </a>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href={`/@${account.acct}`} className="status__display-name" style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ color: 'var(--highlight-text-color)' }}>{account.display_name}</strong>
              <span style={{ fontSize: '13px', color: 'var(--darker-text-color)' }}>@{account.acct} • P2P Verification</span>
            </a>
            <div className="status__relative-time" style={{ fontSize: '12px', color: 'var(--darker-text-color)' }}>
              <RelativeTimestamp timestamp={post.created_at} />
            </div>
          </div>
        </div>
      </div>
      
      {post.spoiler_text && (
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#888' }}>
          {post.spoiler_text}
        </div>
      )}
      
      <div 
        className="status__content__text" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
        style={{ fontSize: '15px', lineHeight: '1.4' }}
      />
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <GlobeIcon style={{ width: 14, height: 14, fill: '#4ADE80' }} /> Synced via Decentralized Mesh
      </div>
    </div>
  );
};

const P2PTimeline = ({ intl, multiColumn }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Subscribe directly to the GunJS P2P network, skipping the Mastodon Backend
    const unsubscribe = p2pFeed.subscribeToFeed((syncedPosts) => {
      setPosts(syncedPosts);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const emptyMessage = (
    <div className="empty-column-indicator">
      <FormattedMessage
        id='empty_column.p2p'
        defaultMessage='The P2P network is currently empty. Broadcast a public message to seed the mesh!'
      />
    </div>
  );

  return (
    <Column bindToDocument={!multiColumn} label={intl.formatMessage(messages.title)}>
      <ColumnHeader
        icon='globe'
        iconComponent={GlobeIcon}
        title={intl.formatMessage(messages.title)}
        multiColumn={multiColumn}
      />

      <div className="scrollable" style={{ paddingBottom: '60px' }}>
        {posts.length === 0 ? emptyMessage : (
          <div>
            {posts.map(post => <P2PStatus key={post.id} post={post} />)}
          </div>
        )}
      </div>

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

export default injectIntl(P2PTimeline);
