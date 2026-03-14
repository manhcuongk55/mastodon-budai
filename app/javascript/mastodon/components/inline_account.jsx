import { PureComponent } from 'react';

import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { Avatar } from 'mastodon/components/avatar';
import { makeGetAccount } from 'mastodon/selectors';

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = (state, { accountId }) => ({
    account: getAccount(state, accountId),
  });

  return mapStateToProps;
};

class InlineAccount extends PureComponent {

  static propTypes = {
    account: ImmutablePropTypes.record.isRequired,
  };

  render () {
    const { account } = this.props;

    return (
      <span className='inline-account' style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Avatar size={16} account={account} /> 
        <strong>{account.get('username')}</strong>
        
        {/* Pirate Truth Economy Gamification Elements */}
        <span style={{
          backgroundColor: '#F8FAFC', padding: '2px 6px', borderRadius: '4px',
          fontSize: '11px', color: '#0EA5E9', border: '1px solid #BAE6FD', fontWeight: 'bold'
        }}>
          ⚓ Navigator
        </span>
        <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 'bold' }}>
          🫐 {account.get('truth_berries', 150)}
        </span>
      </span>
    );
  }

}

export default connect(makeMapStateToProps)(InlineAccount);
