import type { ComponentPropsWithoutRef, FC } from 'react';

import classNames from 'classnames';

import { AnimateEmojiProvider } from '../emoji/context';
import { EmojiHTML } from '../emoji/html';
import { Skeleton } from '../skeleton';

import type { DisplayNameProps } from './index';

export const DisplayNameWithoutDomain: FC<
  Omit<DisplayNameProps, 'variant'> & ComponentPropsWithoutRef<'span'>
> = ({ account, className, children, localDomain: _, ...props }) => {
  return (
    <AnimateEmojiProvider
      {...props}
      as='span'
      className={classNames('display-name', className)}
    >
      <bdi>
        {account ? (
          <>
            <EmojiHTML
              className='display-name__html'
              htmlString={account.get('display_name_html')}
              as='strong'
              extraEmojis={account.get('emojis')}
            />
            {account.get('is_guardian') && (
              <span title="Guardian of the Network" style={{ marginLeft: '4px', verticalAlign: 'middle', fontSize: '0.9em' }}>🛡️</span>
            )}
            {account.get('campaign_pioneer') && (
              <span title="Pioneer of Truth (Chiến dịch Toàn dân)" style={{ marginLeft: '4px', background: 'linear-gradient(45deg, #1da1f2, #17bf63)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold', fontSize: '0.8em', border: '1px solid #1da1f2', padding: '1px 4px', borderRadius: '4px', verticalAlign: 'middle' }}>Tiên Phong 🇻🇳</span>
            )}
          </>
        ) : (
          <strong className='display-name__html'>
            <Skeleton width='10ch' />
          </strong>
        )}
      </bdi>
      {children}
    </AnimateEmojiProvider>
  );
};
