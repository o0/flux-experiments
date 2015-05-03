/** @jsx React.DOM */

var React = require('react/addons');
var RepositoryActions = require('../actions/repository-actions');
var repositoryActions = RepositoryActions.getInstance();
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();


/**
 * @constructor
 * @extends {ReactComponent}
 */
var RepositoryForm = React.createClass({
  getDefaultProps: function() {
    return {
      hidden: false
    }
  },

  getInitialState: function() {
    return {
      errorMessage: repositoryStore.getErrorMessage(),
      repositoriesList: repositoryStore.getRepositoriesList()
    }
  },

  componentDidMount: function() {
    repositoryStore.
        on(RepositoryStore.EventType.SET_REPOSITORIES_LIST, this.onStoreChange_).
        on(RepositoryStore.EventType.REPOSITORIES_LOAD_ERROR, this.onStoreChange_);
  },

  componentWillUnmount: function() {
    repositoryStore.
        removeAllListeners(RepositoryStore.EventType.SET_REPOSITORIES_LIST, this.onStoreChange_);
        removeAllListeners(RepositoryStore.EventType.REPOSITORIES_LOAD_ERROR, this.onStoreChange_);
  },

  render: function() {
    if (this.props.hidden) {
      return null;
    }

    return (<form className="form-overlay" onChange={this.onChange_} onSubmit={this.onSubmit_}>
      <fieldset>
        <label htmlFor="repository-form-author">Author</label>
        <input id="repository-form-author" onBlur={this.onAuthorEntered_} required="true" type="text" />
        <label htmlFor="repository-form-name">Repository name</label>
        <input id="repository-form-name" onBlur={this.onRepositoryEntered_} type="text" list="form-repositories-list" required="true" />
        <input type="submit" disabled={!this.state.formIsValid} value="Search" />
        <span id="repository-error-message">{this.state.errorMessage}</span>
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
      repositoriesList: repositoryStore.getRepositoriesList()
    });
  },

  /**
   * @param {SyntheticEvent} evt
   * @private
   */ 
  onSubmit_: function(evt) {
    evt.preventDefault();
    var formElement = this.getDOMNode();
    repositoryActions.loadRepository(formElement['repository-form-author'].value,
                                     formElement['repository-form-name'].value);
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

    // Do not show error message if one of the input elements is focused.
    if (!repositoryName && !this.inputIsFocused()) {
      return;
    }

    if (this.state.repositoriesList.indexOf(repositoryName) === -1) {
      this.setState({
        errorMessage: ['User', username, 'doesn\'t have repository named',repositoryName].join(' ')
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

  checkValidity: function() {
    var formElement = this.getDOMNode();

    this.setState({
      formIsValid: formElement['repository-form-author'].validity.valid &&
                   formElement['repository-form-name'].validity.valid &&
                   !this.state.errorMessage
    });
  }
});


module.exports = RepositoryForm;
