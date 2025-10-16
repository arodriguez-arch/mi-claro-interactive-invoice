import { h, FunctionalComponent } from '@stencil/core';

interface AccountSelectorProps {
  accountList: string[];
  selectedAccount: string;
  onAccountChange: (event: Event) => void;
}

/**
 * Dropdown selector for switching between accounts
 */
export const AccountSelector: FunctionalComponent<AccountSelectorProps> = ({
  accountList,
  selectedAccount,
  onAccountChange
}) => {
  if (!accountList || accountList.length <= 1) {
    return null;
  }

  return (
    <div class="account-selector-container">
      <label htmlFor="account-select" class="account-label">Selecciona una cuenta:</label>
      <select
        id="account-select"
        class="account-select"
        onChange={onAccountChange}
      >
        {accountList.map((account) => (
          <option key={account} value={account} selected={account === selectedAccount}>
            {account}
          </option>
        ))}
      </select>
    </div>
  );
};
