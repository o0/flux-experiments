/** @jsx React.DOM */

require('./app-view.scss');
var ApplicationStore = require('../stores/application-store');
var applicationStore = ApplicationStore.getInstance();
var React = require('react/addons');
var RepositoryForm = require('./repository-form.jsx');
var RepositoryStructure = require('./repository-structure.jsx');


/**
 * @constructor
 * @extends {ReactComponent}
 */
var AppView = React.createClass({
  getInitialState: function() {
    return {
      repositoryFormIsHidden: applicationStore.hasState(ApplicationStore.State.REPOSITORY_IS_LOADED)
    }
  },

  componentDidMount: function() {
    applicationStore.
        on(ApplicationStore.EventType.LOAD_REPOSITORY, this.onApplicationStoreChange_).
        on(ApplicationStore.EventType.SET_STATE, this.onApplicationStoreChange_);
  },

  componentWillUnmount: function() {
    applicationStore.removeAllListeners(ApplicationStore.EventType.CHANGE);
  },

  render: function() {
    return (<div className='application-layout'>
      <RepositoryForm hidden={this.state.repositoryFormIsHidden} />
      <RepositoryStructure />
    </div>);
  },

  onApplicationStoreChange_: function() {
    this.setState({
      repositoryFormIsHidden: applicationStore.hasState(ApplicationStore.State.REPOSITORY_IS_LOADED)
    });
  }
});


module.exports = AppView;
