/** @jsx React.DOM */

require('./repository-form.scss');
var React = require('react/addons');
var RepositoryActions = require('../actions/repository-actions');
var repositoryActions = RepositoryActions.getInstance();
var NavActions = require('../actions/nav-actions');
var navActions = NavActions.getInstance();
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();
var utils = require('../utils/utils')


/**
 * @constructor
 * @extends {ReactComponent}
 */
var RepositoryForm = React.createClass({
  getDefaultProps: function() {
    return {
      hidden: false,
      isInline: false
    }
  },

  getInitialState: function() {
    return {
      errorMessage: repositoryStore.getErrorMessage(),
      isLoading: false,
      repositoriesList: repositoryStore.getRepositoriesList(),
      repositoryName: repositoryStore.getRepositoryName(),
      username: repositoryStore.getUserName()
    }
  },

  componentWillMount: function() {
    this.setState({
      className: new utils.ClassName(this.props.isInline ? 'form-inline' : 'form-overlay')
    });
  },

  componentDidMount: function() {
    repositoryStore.
        on(RepositoryStore.EventType.SET_REPOSITORIES_LIST, this.onStoreChange_).
        on(RepositoryStore.EventType.REPOSITORIES_LOAD_ERROR, this.onStoreChange_).
        on(RepositoryStore.EventType.LOAD_START, this.onStoreChange_).
        on(RepositoryStore.EventType.CHANGE, this.onStoreChange_);

    if (!this.props.isInline) {
      this.getDOMNode()['repository-form-author'].focus();
    }

    this.checkValidity();
  },

  componentWillUnmount: function() {
    // fixme: This code doesn't work because I never call unmountComponent at this component.
    repositoryStore.
        removeAllListeners(RepositoryStore.EventType.SET_REPOSITORIES_LIST, this.onStoreChange_).
        removeAllListeners(RepositoryStore.EventType.REPOSITORIES_LOAD_ERROR, this.onStoreChange_).
        removeAllListeners(RepositoryStore.EventType.LOAD_START, this.onStoreChange_).
        removeAllListeners(RepositoryStore.EventType.CHANGE, this.onStoreChange_);
  },

  render: function() {
    if (this.props.hidden) {
      return null;
    }

    var className = this.state.className;

    return (<form className={className.getClassName()} onChange={this.onChange_} onSubmit={this.onSubmit_}>
      <fieldset className={className.getClassName('content')}>
        <div className={className.getClassName('intro')}>
          <img src="/GitHub-Mark-32px.png" />
        </div>

        <label className={className.getClassName('label')} htmlFor="repository-form-author">Author</label>
        <input className={className.getClassName('input')} defaultValue={this.state.username} id="repository-form-author" onBlur={this.onAuthorEntered_} required="true" type="text" />
        <br />

        <label className={className.getClassName('label')} htmlFor="repository-form-name">Repository</label>
        <input className={className.getClassName('input')} defaultValue={this.state.repositoryName} id="repository-form-name" onBlur={this.onRepositoryEntered_} type="text" list="form-repositories-list" required="true" />
        <br />

        <input className={className.getClassName('submit')} id="repository-form-submit" type="submit" disabled={!this.state.formIsValid || this.state.isLoading} value="Show" />
        <span className={className.getClassName('error')} id="repository-error-message">{this.state.errorMessage}</span>
      </fieldset>

      <datalist id="form-repositories-list">{this.state.repositoriesList.map(function(repositoryName) {
        return <option key={repositoryName}>{repositoryName}</option>
      })}</datalist>
    </form>);
  },

  /**
   * @private
   */ 
  onStoreChange_: function() {
    this.setState({
      errorMessage: repositoryStore.getErrorMessage(),
      repositoriesList: repositoryStore.getRepositoriesList(),
      isLoading: repositoryStore.isLoading()
    });
  },

  /**
   * @param {SyntheticEvent} evt
   * @private
   */ 
  onSubmit_: function(evt) {
    evt.preventDefault();
    this.checkValidity(function() {
      if (this.state.formIsValid) {
        var formElement = this.getDOMNode();
        var username = formElement['repository-form-author'].value;
        var repositoryName = formElement['repository-form-name'].value;
        
        //navActions.navigate(NavActions.NavActionType.REPOSITORY, username, repositoryName);
        repositoryActions.loadRevisions(username, repositoryName);
      }
    }, this);
  },

  /**
   * @param {SyntheticEvent} evt
   * @private
   */ 
  onAuthorEntered_: function(evt) {
    var formElement = this.getDOMNode();
    var username = formElement['repository-form-author'].value;
    var repositoryName = formElement['repository-form-name'];

    if (username) {
      // Cleanup already entered repository name for another user.
      if (repositoryName.getAttribute('data-repositories-for') &&
          username !== repositoryName.getAttribute('data-repositories-for')) {
        repositoryName.value = '';
      }

      repositoryName.setAttribute('data-repositories-for', username);
      repositoryActions.loadRepositoriesList(username);
    } else {
      repositoryName.removeAttribute('data-repositories-for');
    }

    this.checkValidity();
  },

  /*
   * @param {SyntheticEvent} evt
   * @private
   */ 
  onRepositoryEntered_: function(evt) {
    var repositoryName = this.getDOMNode()['repository-form-name'].value;
    var username = this.getDOMNode()['repository-form-author'].value;

    repositoryName = repositoryName.replace(/\s+/g, '');

    // Do not show error message if one of the input elements is focused.
    if (!repositoryName && !this.inputIsFocused()) {
      return;
    }

    if (this.state.repositoriesList.indexOf(repositoryName) === -1) {
      this.setState({
        errorMessage: ['User', username, 'doesn\'t have repository named', repositoryName].join(' ')
      });
    }

    this.checkValidity();
  },

  /*
   * @param {SyntheticEvent} evt
   * @private
   */ 
  onChange_: function(evt) {
    this.setState({
      errorMessage: ''
    });

    this.checkValidity();
  },

  /**
   * @return {boolean}
   */
  inputIsFocused: function() {
    var repositoryName = this.getDOMNode()['repository-form-name'];
    var username = this.getDOMNode()['repository-form-author'];
    return [repositoryName, username].indexOf(document.activeElement) > -1
  },

  /**
   * @param {function=} callback
   * @param {*=} ctx
   */
  checkValidity: function(callback, ctx) {
    var formElement = this.getDOMNode();

    this.setState({
      formIsValid: formElement['repository-form-author'].validity.valid &&
                   formElement['repository-form-name'].validity.valid &&
                   !this.state.errorMessage
    }, function() {
      if (typeof callback !== 'undefined') {
        callback.call(ctx)
      }
    });
  }
});


module.exports = RepositoryForm;
