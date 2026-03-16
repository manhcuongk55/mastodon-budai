import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import api from 'mastodon/api';

import BookmarkIcon from '@/material-icons/400-24px/bookmark-fill.svg?react';
import BookmarkBorderIcon from '@/material-icons/400-24px/bookmark.svg?react';
import CheckIcon from '@/material-icons/400-24px/check-fill.svg?react';
import CheckBorderIcon from '@/material-icons/400-24px/check.svg?react';
import CloseIcon from '@/material-icons/400-24px/close.svg?react';
import ShieldIcon from '@/material-icons/400-24px/shield_question-fill.svg?react';
import ShieldBorderIcon from '@/material-icons/400-24px/shield_question.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import ReplyIcon from '@/material-icons/400-24px/reply.svg?react';
import ReplyAllIcon from '@/material-icons/400-24px/reply_all.svg?react';
import StarIcon from '@/material-icons/400-24px/star-fill.svg?react';
import StarBorderIcon from '@/material-icons/400-24px/star.svg?react';
import { identityContextPropShape, withIdentity } from 'mastodon/identity_context';
import { PERMISSION_MANAGE_USERS, PERMISSION_MANAGE_FEDERATION } from 'mastodon/permissions';
import { WithRouterPropTypes } from 'mastodon/utils/react_router';

import { Dropdown } from 'mastodon/components/dropdown_menu';
import { me, quickBoosting } from '../../initial_state';

import { IconButton } from '../icon_button';
import { BoostButton } from '../status/boost_button';
import { RemoveQuoteHint } from './remove_quote_hint';
import { quoteItemState, selectStatusState } from '../status/boost_button_utils';
import { truthVote, addBounty } from '../../actions/interactions';

const messages = defineMessages({
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  redraft: { id: 'status.redraft', defaultMessage: 'Delete & re-draft' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  direct: { id: 'status.direct', defaultMessage: 'Privately mention @{name}' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  more: { id: 'status.more', defaultMessage: 'More' },
  replyAll: { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  favourite: { id: 'status.favourite', defaultMessage: 'Favorite' },
  removeFavourite: { id: 'status.remove_favourite', defaultMessage: 'Remove from favorites' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  removeBookmark: { id: 'status.remove_bookmark', defaultMessage: 'Remove bookmark' },
  truthReal: { id: 'status.truth_real', defaultMessage: 'Trust' },
  truthFake: { id: 'status.truth_fake', defaultMessage: 'Fake' },
  truthSafe: { id: 'status.truth_safe', defaultMessage: 'Safe' },
  open: { id: 'status.open', defaultMessage: 'Expand this status' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  embed: { id: 'status.embed', defaultMessage: 'Get embed code' },
  admin_account: { id: 'status.admin_account', defaultMessage: 'Open moderation interface for @{name}' },
  admin_status: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  admin_domain: { id: 'status.admin_domain', defaultMessage: 'Open moderation interface for {domain}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Block domain {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unblock domain {domain}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  filter: { id: 'status.filter', defaultMessage: 'Filter this post' },
  openOriginalPage: { id: 'account.open_original_page', defaultMessage: 'Open original page' },
  revokeQuote: { id: 'status.revoke_quote', defaultMessage: 'Remove my post from @{name}’s post' },
  quotePolicyChange: { id: 'status.quote_policy_change', defaultMessage: 'Change who can quote' },
  bounty: { id: 'status.bounty', defaultMessage: 'Add Bounty' },
});


const mapStateToProps = (state, { status }) => {
  const quotedStatusId = status.getIn(['quote', 'quoted_status']);
  return ({
    relationship: state.getIn(['relationships', status.getIn(['account', 'id'])]),
    quotedAccountId: quotedStatusId ? state.getIn(['statuses', quotedStatusId, 'account']) : null,
    statusQuoteState: selectStatusState(state, status),
  });
};

class StatusActionBar extends ImmutablePureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    status: ImmutablePropTypes.map.isRequired,
    relationship: ImmutablePropTypes.record,
    statusQuoteState: PropTypes.object,
    quotedAccountId: PropTypes.string,
    contextType: PropTypes.string,
    onReply: PropTypes.func,
    onFavourite: PropTypes.func,
    onDelete: PropTypes.func,
    onRevokeQuote: PropTypes.func,
    onQuotePolicyChange: PropTypes.func,
    onDirect: PropTypes.func,
    onMention: PropTypes.func,
    onMute: PropTypes.func,
    onUnmute: PropTypes.func,
    onBlock: PropTypes.func,
    onUnblock: PropTypes.func,
    onBlockDomain: PropTypes.func,
    onUnblockDomain: PropTypes.func,
    onReport: PropTypes.func,
    onEmbed: PropTypes.func,
    onMuteConversation: PropTypes.func,
    onPin: PropTypes.func,
    onBookmark: PropTypes.func,
    onFilter: PropTypes.func,
    onAddFilter: PropTypes.func,
    onInteractionModal: PropTypes.func,
    withDismiss: PropTypes.bool,
    withCounters: PropTypes.bool,
    scrollKey: PropTypes.string,
    intl: PropTypes.object.isRequired,
    ...WithRouterPropTypes,
  };

  // Avoid checking props that are functions (and whose equality will always
  // evaluate to false. See react-immutable-pure-component for usage.
  updateOnProps = [
    'status',
    'relationship',
    'quotedAccountId',
    'withDismiss',
  ];

  handleReplyClick = () => {
    const { signedIn } = this.props.identity;

    if (signedIn) {
      this.props.onReply(this.props.status);
    } else {
      this.props.onInteractionModal(this.props.status, 'reply');
    }
  };

  handleQuoteClick = () => {
    this.props.onQuote(this.props.status);
  };

  handleShareClick = () => {
    navigator.share({
      url: this.props.status.get('url'),
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  handleSosShareClick = () => {
    const { status } = this.props;
    const url = status.get('url');
    // Epic V: Viral Summoning (Triệu hồi chuyên gia)
    navigator.share({
      title: '🚨 Trusking SOS: We need your verification!',
      text: 'Mạng lưới P2P đang tranh luận về Sự thật/Giả mạo của thông tin này. Hãy tham gia hội thẩm đoàn Trusking để xác minh ngay:',
      url: url,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  handleFavouriteClick = () => {
    const { signedIn } = this.props.identity;

    if (signedIn) {
      this.props.onFavourite(this.props.status);
    } else {
      this.props.onInteractionModal(this.props.status, 'favourite');
    }
  };

  handleBookmarkClick = () => {
    this.props.onBookmark(this.props.status);
  };

  handleTruthVote = (type) => {
    const { status, dispatch } = this.props;
    dispatch(truthVote(status.get('id'), type));
  };

  handleTruthReal = () => this.handleTruthVote('truth');
  handleTruthFake = () => this.handleTruthVote('fake');
  handleTruthSafe = () => this.handleTruthVote('safe');

  handleAddBounty = () => {
    const { status, dispatch } = this.props;
    dispatch(addBounty(status, 10)); // Default 10 berry bounty
  };

  handleRequestVerification = () => {
    const { status } = this.props;
    this.setState({ verifyLoading: true });
    api().post('/api/v1/verification_tasks', {
      status_id: status.get('id'),
      claim_type: 'content',
      claim_text: status.get('contentHtml')?.replace(/<[^>]*>/g, '')?.substring(0, 500) || 'Cần xác minh',
    }).then(() => {
      this.setState({ verifyLoading: false, verifySuccess: true });
      setTimeout(() => this.setState({ verifySuccess: false }), 3000);
    }).catch(() => {
      this.setState({ verifyLoading: false });
    });
  };

  handleDeleteClick = () => {
    this.props.onDelete(this.props.status);
  };

  handleRedraftClick = () => {
    this.props.onDelete(this.props.status, true);
  };

  handleEditClick = () => {
    this.props.onEdit(this.props.status);
  };

  handlePinClick = () => {
    this.props.onPin(this.props.status);
  };

  handleMentionClick = () => {
    this.props.onMention(this.props.status.get('account'));
  };

  handleDirectClick = () => {
    this.props.onDirect(this.props.status.get('account'));
  };

  handleMuteClick = () => {
    const { status, relationship, onMute, onUnmute } = this.props;
    const account = status.get('account');

    if (relationship && relationship.get('muting')) {
      onUnmute(account);
    } else {
      onMute(account);
    }
  };

  handleRevokeQuoteClick = () => {
    this.props.onRevokeQuote(this.props.status);
  };

  handleQuotePolicyChange = () => {
    this.props.onQuotePolicyChange(this.props.status);
  };

  handleBlockClick = () => {
    const { status, relationship, onBlock, onUnblock } = this.props;
    const account = status.get('account');

    if (relationship && relationship.get('blocking')) {
      onUnblock(account);
    } else {
      onBlock(status);
    }
  };

  handleBlockDomain = () => {
    const { status, onBlockDomain } = this.props;
    const account = status.get('account');

    onBlockDomain(account);
  };

  handleUnblockDomain = () => {
    const { status, onUnblockDomain } = this.props;
    const account = status.get('account');

    onUnblockDomain(account.get('acct').split('@')[1]);
  };

  handleOpen = () => {
    this.props.history.push(`/@${this.props.status.getIn(['account', 'acct'])}/${this.props.status.get('id')}`);
  };

  handleEmbed = () => {
    this.props.onEmbed(this.props.status);
  };

  handleReport = () => {
    this.props.onReport(this.props.status);
  };

  handleConversationMuteClick = () => {
    this.props.onMuteConversation(this.props.status);
  };

  handleFilterClick = () => {
    this.props.onAddFilter(this.props.status);
  };

  handleCopy = () => {
    const url = this.props.status.get('url');
    navigator.clipboard.writeText(url);
  };

  render () {
    const { status, relationship, statusQuoteState, quotedAccountId, contextType, intl, withDismiss, withCounters, scrollKey } = this.props;
    const { signedIn, permissions } = this.props.identity;

    const publicStatus       = ['public', 'unlisted'].includes(status.get('visibility'));
    const pinnableStatus     = ['public', 'unlisted', 'private'].includes(status.get('visibility'));
    const mutingConversation = status.get('muted');
    const account            = status.get('account');
    const writtenByMe        = status.getIn(['account', 'id']) === me;
    const isRemote           = status.getIn(['account', 'username']) !== status.getIn(['account', 'acct']);
    const isQuotingMe        = quotedAccountId === me;

    let menu = [];

    menu.push({ text: intl.formatMessage(messages.open), action: this.handleOpen });

    if (publicStatus && isRemote) {
      menu.push({ text: intl.formatMessage(messages.openOriginalPage), href: status.get('url') });
    }

    menu.push({ text: intl.formatMessage(messages.copy), action: this.handleCopy });

    if (publicStatus && 'share' in navigator) {
      menu.push({ text: intl.formatMessage(messages.share), action: this.handleShareClick });
    }

    if (publicStatus && !isRemote) {
      menu.push({ text: intl.formatMessage(messages.embed), action: this.handleEmbed });
    }

    if (quickBoosting && signedIn) {
      const quoteItem = quoteItemState(statusQuoteState);
      menu.push(null);
      menu.push({
        text: intl.formatMessage(quoteItem.title),
        description: quoteItem.meta
          ? intl.formatMessage(quoteItem.meta)
          : undefined,
        disabled: quoteItem.disabled,
        action: this.handleQuoteClick,
      });
    }

    if (signedIn) {
      menu.push(null);

      if (writtenByMe && pinnableStatus) {
        menu.push({ text: intl.formatMessage(status.get('pinned') ? messages.unpin : messages.pin), action: this.handlePinClick });
        menu.push(null);
      }

      if (writtenByMe || withDismiss) {
        menu.push({ text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation), action: this.handleConversationMuteClick });
        if (writtenByMe && !['private', 'direct'].includes(status.get('visibility'))) {
          menu.push({ text: intl.formatMessage(messages.quotePolicyChange), action: this.handleQuotePolicyChange });
        }
        menu.push(null);
      }

      if (writtenByMe) {
        menu.push({ text: intl.formatMessage(messages.edit), action: this.handleEditClick });
      } else {
        menu.push({ text: intl.formatMessage(messages.mention, { name: account.get('username') }), action: this.handleMentionClick });
        menu.push({ text: intl.formatMessage(messages.direct, { name: account.get('username') }), action: this.handleDirectClick });
        menu.push(null);

        if (isQuotingMe) {
          menu.push({ text: intl.formatMessage(messages.revokeQuote, { name: account.get('username') }), action: this.handleRevokeQuoteClick, dangerous: true });
        }

        if (relationship && relationship.get('muting')) {
          menu.push({ text: intl.formatMessage(messages.unmute, { name: account.get('username') }), action: this.handleMuteClick });
        } else {
          menu.push({ text: intl.formatMessage(messages.mute, { name: account.get('username') }), action: this.handleMuteClick, dangerous: true });
        }

        if (relationship && relationship.get('blocking')) {
          menu.push({ text: intl.formatMessage(messages.unblock, { name: account.get('username') }), action: this.handleBlockClick });
        } else {
          menu.push({ text: intl.formatMessage(messages.block, { name: account.get('username') }), action: this.handleBlockClick, dangerous: true });
        }

        if (!this.props.onFilter) {
          menu.push(null);
          menu.push({ text: intl.formatMessage(messages.filter), action: this.handleFilterClick, dangerous: true });
          menu.push(null);
        }

        menu.push({ text: intl.formatMessage(messages.report, { name: account.get('username') }), action: this.handleReport, dangerous: true });

        if (account.get('acct') !== account.get('username')) {
          const domain = account.get('acct').split('@')[1];

          menu.push(null);

          if (relationship && relationship.get('domain_blocking')) {
            menu.push({ text: intl.formatMessage(messages.unblockDomain, { domain }), action: this.handleUnblockDomain });
          } else {
            menu.push({ text: intl.formatMessage(messages.blockDomain, { domain }), action: this.handleBlockDomain, dangerous: true });
          }
        }

        if ((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS || (isRemote && (permissions & PERMISSION_MANAGE_FEDERATION) === PERMISSION_MANAGE_FEDERATION)) {
          menu.push(null);
          if ((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS) {
            menu.push({ text: intl.formatMessage(messages.admin_account, { name: account.get('username') }), href: `/admin/accounts/${status.getIn(['account', 'id'])}` });
            menu.push({ text: intl.formatMessage(messages.admin_status), href: `/admin/accounts/${status.getIn(['account', 'id'])}/statuses/${status.get('id')}` });
          }
          if (isRemote && (permissions & PERMISSION_MANAGE_FEDERATION) === PERMISSION_MANAGE_FEDERATION) {
            const domain = account.get('acct').split('@')[1];
            menu.push({ text: intl.formatMessage(messages.admin_domain, { domain: domain }), href: `/admin/instances/${domain}` });
          }
        }
      }
    }

    let replyIcon;
    let replyIconComponent;
    let replyTitle;

    if (status.get('in_reply_to_id', null) === null) {
      replyIcon = 'reply';
      replyIconComponent = ReplyIcon;
      replyTitle = intl.formatMessage(messages.reply);
    } else {
      replyIcon = 'reply-all';
      replyIconComponent = ReplyAllIcon;
      replyTitle = intl.formatMessage(messages.replyAll);
    }

    const bookmarkTitle = intl.formatMessage(status.get('bookmarked') ? messages.removeBookmark : messages.bookmark);
    const favouriteTitle = intl.formatMessage(status.get('favourited') ? messages.removeFavourite : messages.favourite);
    const isReply = status.get('in_reply_to_account_id') === status.getIn(['account', 'id']);

    const shouldShowQuoteRemovalHint = isQuotingMe && contextType === 'notifications';

    return (
      <div className='status__action-bar'>
        <div className='status__action-bar__button-wrapper'>
          <IconButton className='status__action-bar__button truth-icon-pill truth-icon-pill--real' animate active={status.get('truth_vote') === 'truth'} title={intl.formatMessage(messages.truthReal)} icon='check' iconComponent={status.get('truth_vote') === 'truth' ? CheckIcon : CheckBorderIcon} onClick={this.handleTruthReal} counter={status.get('truth_count') || undefined} />
        </div>
        <div className='status__action-bar__button-wrapper'>
          <IconButton className='status__action-bar__button truth-icon-pill truth-icon-pill--safe' animate active={status.get('truth_vote') === 'safe'} title={intl.formatMessage(messages.truthSafe)} icon='shield' iconComponent={status.get('truth_vote') === 'safe' ? ShieldIcon : ShieldBorderIcon} onClick={this.handleTruthSafe} counter={status.get('safe_count') || undefined} />
        </div>
        <div className='status__action-bar__button-wrapper'>
          <IconButton className='status__action-bar__button truth-icon-pill truth-icon-pill--fake' animate active={status.get('truth_vote') === 'fake'} title={intl.formatMessage(messages.truthFake)} icon='close' iconComponent={CloseIcon} onClick={this.handleTruthFake} counter={status.get('fake_count') || undefined} />
        </div>

        {/* Gamification: Add Bounty */}
        {signedIn && (
          <div className='status__action-bar__button-wrapper'>
            <button className='status__action-bar__bounty-button' title={intl.formatMessage(messages.bounty)} onClick={this.handleAddBounty}>
               🫐 <span className='bounty-counter'>{status.get('bounty_amount') || 0}</span>
            </button>
          </div>
        )}

        {/* Epic V: Viral Summoning */}
        {signedIn && 'share' in navigator && (
          <div className='status__action-bar__button-wrapper'>
            <button 
              onClick={this.handleSosShareClick}
              style={{ background: 'transparent', border: '1px solid #ffad1f', color: '#ffad1f', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Share an SOS challenge link to Zalo/Facebook to recruit expert fact-checkers."
            >
              🚨 Gọi Hội Thẩm
            </button>
          </div>
        )}

        {/* Epic AF: Request Community Verification */}
        {signedIn && (
          <div className='status__action-bar__button-wrapper'>
            <button
              onClick={this.handleRequestVerification}
              disabled={this.state?.verifyLoading || this.state?.verifySuccess}
              style={{
                background: this.state?.verifySuccess ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                border: `1px solid ${this.state?.verifySuccess ? '#10B981' : '#6366F1'}`,
                color: this.state?.verifySuccess ? '#10B981' : '#6366F1',
                borderRadius: '4px', padding: '4px 8px', fontSize: '11px',
                fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.3s',
              }}
              title="Yêu cầu cộng đồng xác minh bài viết này"
            >
              {this.state?.verifyLoading ? '⏳' : this.state?.verifySuccess ? '✅ Đã Gửi' : '🔍 Xác Minh'}
            </button>
          </div>
        )}
      </div>
    );
  }

}

export default withRouter(withIdentity(connect(mapStateToProps)(injectIntl(StatusActionBar))));
