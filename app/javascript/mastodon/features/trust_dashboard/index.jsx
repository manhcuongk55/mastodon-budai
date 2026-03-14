import { PureComponent } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Column from '../ui/components/column';
import ColumnHeader from '../ui/components/column_header';
import AccountContainer from '../../containers/account_container';
import { fetchTrustLeaderboard } from '../../actions/trust_leaderboards';
import LoadingIndicator from '../../components/loading_indicator';
import ScrollableList from '../../components/scrollable_list';
import ShieldIcon from '@/material-icons/400-24px/shield.svg?react';

const mapStateToProps = state => ({
  accountIds: state.getIn(['trust_leaderboards', 'items']),
  isLoading: state.getIn(['trust_leaderboards', 'isLoading']),
});

class TrustDashboard extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    accountIds: ImmutablePropTypes.list.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };

  componentDidMount () {
    this.props.dispatch(fetchTrustLeaderboard());
  }

  render () {
    const { accountIds, isLoading } = this.props;

    let emptyMessage;

    if (isLoading && accountIds.isEmpty()) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    if (accountIds.isEmpty()) {
      emptyMessage = <FormattedMessage id='trust_leaderboard.empty' defaultMessage='No trusted users yet. Start voting!' />;
    }

    return (
      <Column>
        <ColumnHeader
          icon='shield'
          iconComponent={ShieldIcon}
          title={'Trust Leaderboard'}
        />

        <div className='scrollable'>
          <ScrollableList
            scrollKey='trust_dashboard'
            emptyMessage={emptyMessage}
          >
            {accountIds.map((accountId, index) => (
               <div key={accountId} style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid var(--color-background-offset)' }}>
                 <div style={{ marginRight: '15px', fontSize: '24px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center', color: index < 3 ? '#F4C542' : 'var(--color-primary-text)', textShadow: index < 3 ? '0 0 10px rgba(244, 197, 66, 0.4)' : 'none' }}>
                   #{index + 1}
                 </div>
                 <div style={{ flex: 1 }}>
                   <AccountContainer id={accountId} />
                 </div>
               </div>
            ))}
          </ScrollableList>
        </div>
      </Column>
    );
  }
}

export default connect(mapStateToProps)(TrustDashboard);
