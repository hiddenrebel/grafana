import React, { PureComponent } from 'react';
import { Modal, VerticalGroup } from '@grafana/ui';
import { css } from 'emotion';
import { dashboardWatcher } from './dashboardWatcher';
import { config } from '@grafana/runtime';
import { DashboardEvent, DashboardEventAction } from './types';

interface Props {
  event?: DashboardEvent;
}

interface State {
  dismiss?: boolean;
}

interface ActionInfo {
  label: string;
  description: string;
  action: () => void;
}

export class DashboardChangedModal extends PureComponent<Props, State> {
  state: State = {};

  discardAndReload: ActionInfo = {
    label: 'Discard local changes',
    description: 'Load the latest saved version for this dashboard',
    action: () => {
      dashboardWatcher.reloadPage();
      this.onDismiss();
    },
  };

  continueEditing: ActionInfo = {
    label: 'Continue editing',
    description:
      'Keep your local changes and continue editing.  Note: when you save, this will overwrite the most recent chages',
    action: () => {
      this.onDismiss();
    },
  };

  acceptDelte: ActionInfo = {
    label: 'Discard Local changes',
    description: 'view grafana homepage',
    action: () => {
      // Navigate to the root URL
      document.location.href = config.appUrl;
    },
  };

  onDismiss = () => {
    this.setState({ dismiss: true });
  };

  render() {
    const { event } = this.props;
    const { dismiss } = this.state;
    const radioClass = css`
      cursor: pointer;
      width: 100%;
      padding: 20px;
      background: ${config.theme.colors.dropdownBg};

      &:hover {
        background: ${config.theme.colors.formCheckboxBgCheckedHover};
      }
    `;

    const isDelete = event?.action === DashboardEventAction.Deleted;

    const options = isDelete ? [this.continueEditing, this.acceptDelte] : [this.continueEditing, this.discardAndReload];

    return (
      <Modal
        isOpen={!!!dismiss}
        title="Dashboard Changed"
        icon="copy"
        onDismiss={this.onDismiss}
        className={css`
          width: 500px;
        `}
      >
        <div>
          {isDelete ? (
            <div>This dashboard has been deleted by another session</div>
          ) : (
            <div>This dashboard has been modifed by another session</div>
          )}
          <br />
          <VerticalGroup>
            {options.map(opt => {
              return (
                <div key={opt.label} onClick={opt.action} className={radioClass}>
                  <h3>{opt.label}</h3>
                  {opt.description}
                </div>
              );
            })}
          </VerticalGroup>
          <br />
        </div>
      </Modal>
    );
  }
}