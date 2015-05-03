/** @jsx React.DOM */

require('./app-view.scss');
var ApplicationStore = require('../stores/application-store');
var applicationStore = ApplicationStore.getInstance();
var React = require('react/addons');
var RepositoryForm = require('../components/repository-form.jsx');
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();


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
  getInitialState: function() {
    return {
      repositoriesList: repositoryStore.getRepositoriesList(),
      revisionsList: repositoryStore.getRevisionsList(),
      username: repositoryStore.getUserName(),
      revisionsPerPage: 8
    }
  },

  componentDidMount: function() {
    repositoryStore.on(RepositoryStore.EventType.SET_REVISIONS_LIST, this.onSetRevisions_);
  },

  render: function() {
    return (<div className="structure">
      <div className="structure-repository"></div>
      <div className="structure-revisions">{
        this.state.revisionsList.map(function(revision) {
          return <div>
            {revision.commit.message}, <small>{revision.commit.committer.name}</small>
          </div>
        })
      }</div>
      <div className="structure-revision"></div>
    </div>);
  },

  /**
   * @private
   */
  onSetRevisions_: function() {
    this.setState({
      revisionsList: repositoryStore.getRevisionsList()
    });
  }
});


module.exports = AppView;
