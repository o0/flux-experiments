/** @jsx React.DOM */

require('./app-view.scss');
var ApplicationStore = require('../stores/application-store');
var applicationStore = ApplicationStore.getInstance();
var React = require('react/addons');
var RepositoryForm = require('./repository-form.jsx');
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();
var RepositoryStructure = require('./repository-structure.jsx');


/**
 * @constructor
 * @extends {ReactComponent}
 */
var AppView = React.createClass({
  getInitialState: function() {
    return {
      repositoryFormIsHidden: repositoryStore.getRevisionsList().length > 0
    }
  },

  componentDidMount: function() {
    repositoryStore.on(RepositoryStore.EventType.CHANGE, this.onStoreChange_);
  },

  componentWillUnmount: function() {
    repositoryStore.removeListener(RepositoryStore.EventType.CHANGE, this.onStoreChange_);
  },

  render: function() {
    return (<div className='application-layout'>
      <RepositoryForm hidden={this.state.repositoryFormIsHidden} />
      <RepositoryStructure />
    </div>);
  },

  /** @private */
  onStoreChange_: function() {
    this.setState({
      repositoryFormIsHidden: repositoryStore.getRevisionsList().length > 0
    });
  }
});


module.exports = AppView;
