/** @jsx React.DOM */

var React = require('react/addons');
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();

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

module.exports = RepositoryStructure;
