/** @jsx React.DOM */

var ApplicationStore = require('../stores/application-store');
var applicationStore = ApplicationStore.getInstance();
var React = require('react/addons');
var RepositoryForm = require('../components/repository-form.jsx');


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
    applicationStore.on(ApplicationStore.EventType.LOAD_REPOSITORY, function() {
      this.setState({
        repositoryFormIsHidden: applicationStore.hasState(ApplicationStore.State.REPOSITORY_IS_LOADED)
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    applicationStore.removeAllListeners(ApplicationStore.EventType.CHANGE);
  },

  render: function() {
    return (<div className='application-layout'>
      <RepositoryForm hidden={this.state.repositoryFormIsHidden} />
      <RepositoryStructure />
    </div>);
  }
});


/**
 * @constructor
 * @extends {ReactComponent}
 * @private
 */ 
var RepositoryStructure = React.createClass({
  render: function() {
    return (<div className="structure">
      <div className="structure-repository"></div>
      <div className="structure-revisions"></div>
      <div className="structure-revision"></div>
    </div>);
  }
});


module.exports = AppView;
