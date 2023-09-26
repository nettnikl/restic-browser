import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { MobxLitElement } from '@adobe/lit-mobx';

import { appState } from './states/app-state';

import './components/app-footer';
import './components/app-header';
import './components/file-list';
import './components/snapshot-list';
import './components/location-dialog';
import './components/error-message';

import '@vaadin/vertical-layout';
import '@vaadin/split-layout';

// -------------------------------------------------------------------------------------------------
 
// Main app layout.

@customElement('restic-browser-app')
export class ResticBrowserApp extends MobxLitElement {
  
  @state()
  private _showLocationDialog: boolean = false;
  @state()
  private _showInitRepoDialog: boolean = false;

  constructor() {
    super();
    this._keyDownHandler = this._keyDownHandler.bind(this);
  }
  
  private _keyDownHandler(event: KeyboardEvent) {
    if (!this._showInitRepoDialog && event.ctrlKey && event.key == "o") {
      this._showLocationDialog = true;
      event.preventDefault();
    }
    if (!this._showLocationDialog && event.ctrlKey && event.key == "n") {
      this._showInitRepoDialog = true;
      event.preventDefault();
    }
  }

  static styles = css`
    #layout {
       align-items: stretch; 
       width: 100vw; 
       height: 100%;
    }
    #footer {
      height: auto;
    }
    #split {
      height: 100%;
      width: 100vw;
    }
    #snapshots {
      height: 30%;
      min-height: 25%;
    }
    #filelist {
      height: 70%;
      min-height: 25%;
    }
    #footer {
      height: 44px;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    document.body.addEventListener("keydown", this._keyDownHandler);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.body.removeEventListener("keydown", this._keyDownHandler);
  }

  render() {
    // repository location dialog
    if (this._showLocationDialog) {
      return html`
        <restic-browser-location-dialog 
          .onClose=${() => {
            this._showLocationDialog = false;
            appState.openRepository();
          }}
          .onCancel=${() => {
            this._showLocationDialog = false; 
          }}>
        </restic-browser-location-dialog>
      `;
    }
    // create new repository dialog
    if (this._showInitRepoDialog) {
      return html`
        <restic-browser-location-dialog
            title="Create new repository"
          .onClose=${() => {
            this._showInitRepoDialog = false;
            appState.initRepository();
          }}
          .onCancel=${() => {
            this._showInitRepoDialog = false; 
          }}>
        </restic-browser-location-dialog>
      `;
    }
    // repository error
    if (appState.repoError || ! appState.repoLocation.path) {
      const errorMessage = appState.repoError ? appState.repoError : "No repository selected";
      return html`
        <vaadin-vertical-layout id="layout">
          <restic-browser-app-header id="header" 
            .openRepositoryClick=${() => this._showLocationDialog = true }
            .refreshRepositoryClick=${() => appState.openRepository() }
          >
          </restic-browser-app-header>
          <restic-browser-error-message 
              type=${appState.repoError ? "error" : "info"} 
              message=${errorMessage}>
          </restic-browser-error-message>
          <vaadin-button theme="primary"
                         @click=${() => this._showInitRepoDialog = true }>
            Create new Repository
          </vaadin-button>
        </vaadin-vertical-layout>
      `;
    }
    // repsitory browser layout
    return html`
      <vaadin-vertical-layout id="layout">
        <restic-browser-app-header id="header" 
          .openRepositoryClick=${() => this._showLocationDialog = true }
          .refreshRepositoryClick=${() => appState.openRepository() }
        >
        </restic-browser-app-header>
        <vaadin-split-layout id="split" orientation="vertical" theme="small">
        <restic-browser-snapshot-list id="snapshots"></restic-browser-snapshot-list>
          <restic-browser-file-list id="filelist"></restic-browser-file-list>
        </vaadin-split-layout> 
        <restic-browser-app-footer id="footer"></restic-browser-app-footer>
      </vaadin-vertical-layout>
    `;
  }
}

// -------------------------------------------------------------------------------------------------

declare global {
  interface HTMLElementTagNameMap {
    'restic-browser-app': ResticBrowserApp
  }
}
