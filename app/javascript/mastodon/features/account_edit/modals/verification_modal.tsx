import { useCallback, useId, useState } from 'react';
import type { FC } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import type { BaseConfirmationModalProps } from '@/mastodon/features/ui/components/confirmation_modals';
import { ConfirmationModal } from '@/mastodon/features/ui/components/confirmation_modals';

const messages = defineMessages({
  title: {
    id: 'account_edit.verification_modal.title',
    defaultMessage: 'Identity Verification Dossier',
  },
  save: {
    id: 'account_edit.verification_modal.save',
    defaultMessage: 'Encrypt & Submit',
  },
});

export const VerificationModal: FC<BaseConfirmationModalProps> = ({ onClose }) => {
  const intl = useIntl();
  const titleId = useId();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  const handleSave = useCallback(() => {
    // Mocking the P2P Zero-Knowledge cryptography for now
    setIsEncrypting(true);
    setTimeout(() => {
      setIsEncrypting(false);
      onClose();
    }, 1500);
  }, [onClose]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSelected(true);
    }
  }, []);

  return (
    <ConfirmationModal
      title={intl.formatMessage(messages.title)}
      titleId={titleId}
      confirm={intl.formatMessage(messages.save)}
      onConfirm={handleSave}
      onClose={onClose}
      updating={isEncrypting}
      disabled={!fileSelected}
      noFocusButton
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
        <p>
          <FormattedMessage
            id='account_edit.verification_modal.explanation'
            defaultMessage='Please upload a clear photo of your Government ID. According to our Zero-Knowledge architecture, this file will be AES-encrypted locally on your device. Only designated P2P Guardians can decrypt it for the audit.'
          />
        </p>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
          />
        </div>
      </div>
    </ConfirmationModal>
  );
};
