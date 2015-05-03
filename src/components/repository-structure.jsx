/** @jsx React.DOM */

require('./repository-structure.scss');
var React = require('react/addons');
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();

/**
 * @constructor
 * @extends {ReactComponent}
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
      <div className="structure-repository structure-col"></div>
      <div className="structure-revisions structure-col">{
        this.state.revisionsList.map(function(revision, index) {
          return <div key={['revision', index].join('-')} className="structure-revision">
            {revision.commit.message}<br />
            <small>{revision.commit.committer.name}, {new Date(revision.commit.committer.date).toLocaleString()}</small>
          </div>
        })
      }</div>
      <div className="structure-revision-details structure-col structure-revision-details-empty"></div>
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
