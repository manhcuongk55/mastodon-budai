import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect, useState } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { useDispatch } from 'react-redux';

import AlternateEmailIcon from '@/material-icons/400-24px/alternate_email.svg?react';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import { mountConversations, unmountConversations, expandConversations } from 'mastodon/actions/conversations';
import { connectDirectStream } from 'mastodon/actions/streaming';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';

import { ConversationsList } from './components/conversations_list';
import { P2PChatRoom } from './components/p2p_chat_room';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Private mentions' },
});

const DirectTimeline = ({ columnId, multiColumn }) => {
  const columnRef = useRef();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('direct'); // direct | p2p
  const pinned = !!columnId;

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('DIRECT', {}));
    }
  }, [dispatch, columnId]);

  const handleMove = useCallback((dir) => {
    dispatch(moveColumn(columnId, dir));
  }, [dispatch, columnId]);

  const handleHeaderClick = useCallback(() => {
    columnRef.current.scrollTop();
  }, [columnRef]);

  useEffect(() => {
    dispatch(mountConversations());
    dispatch(expandConversations());

    const disconnect = dispatch(connectDirectStream());

    return () => {
      dispatch(unmountConversations());
      disconnect();
    };
  }, [dispatch]);

  return (
    <Column bindToDocument={!multiColumn} ref={columnRef} label={intl.formatMessage(messages.title)}>
      <ColumnHeader
        icon='at'
        iconComponent={AlternateEmailIcon}
        title={intl.formatMessage(messages.title)}
        onPin={handlePin}
        onMove={handleMove}
        onClick={handleHeaderClick}
        pinned={pinned}
        multiColumn={multiColumn}
      />

      <div className='account__section-headline'>
        <button
          className={`text-btn ${activeTab === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveTab('direct')}
          style={{ flex: 1, padding: '10px', textAlign: 'center', fontWeight: activeTab === 'direct' ? 600 : 400 }}
        >
          Mastodon DMs
        </button>
        <button
          className={`text-btn ${activeTab === 'p2p' ? 'active' : ''}`}
          onClick={() => setActiveTab('p2p')}
          style={{ flex: 1, padding: '10px', textAlign: 'center', fontWeight: activeTab === 'p2p' ? 600 : 400, color: '#4ade80' }}
        >
          <span style={{ marginRight: '4px' }}>🏴‍☠️</span> P2P Off-Grid
        </button>
      </div>

      {activeTab === 'direct' ? (
        <ConversationsList
          trackScroll={!pinned}
          scrollKey={`direct_timeline-${columnId}`}
          emptyMessage={<FormattedMessage id='empty_column.direct' defaultMessage="You don't have any private mentions yet. When you send or receive one, it will show up here." />}
          bindToDocument={!multiColumn}
          prepend={<div className='follow_requests-unlocked_explanation'><span><FormattedMessage id='compose_form.encryption_warning' defaultMessage='Posts on Mastodon are not end-to-end encrypted. Do not share any dangerous information over Mastodon.' /> <a href='/terms' target='_blank'><FormattedMessage id='compose_form.direct_message_warning_learn_more' defaultMessage='Learn more' /></a></span></div>}
          alwaysPrepend
        />
      ) : (
        <div style={{ flex: '1 1 auto', overflowY: 'hidden' }}>
          <P2PChatRoom />
        </div>
      )}

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

DirectTimeline.propTypes = {
  columnId: PropTypes.string,
  multiColumn: PropTypes.bool,
};

export default DirectTimeline;
