/** @jsx React.DOM */

require('./repository-structure.scss');
var React = require('react/addons');
var RepositoryActions = require('../actions/repository-actions');
var repositoryActions = RepositoryActions.getInstance();
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();


/**
 * @constructor
 * @extends {ReactComponent}
 */ 
var RepositoryStructure = React.createClass({
  getInitialState: function() {
    return {
      activeRevision: repositoryStore.getRevisionHash(),
      repositoriesList: repositoryStore.getRepositoriesList(),
      revisionsList: repositoryStore.getRevisionsList(),
      revisionsPerPage: 8,
      username: repositoryStore.getUserName()
    }
  },

  componentDidMount: function() {
    repositoryStore.
        on(RepositoryStore.EventType.SET_REVISIONS_LIST, this.onSetRevisions_).
        on(RepositoryStore.EventType.SET_REVISION, this.onSetRevision_);
  },

  render: function() {
    return (<div className="structure">
      <div className="structure-repository structure-col"></div>
      <div className="structure-revisions structure-col">{
        this.state.revisionsList.map(function(revision) {
          return <Revision key={revision.sha} isActive={this.state.activeRevision === revision.sha} revision={revision} onClick={function(evt) {
            this.onRevisionClick_.call(this, evt, revision.sha);
          }.bind(this)} />
        }, this)
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
  },

  /**
   * @private
   */
  onSetRevision_: function() {
    this.setState({
      activeRevision: repositoryStore.getRevisionHash()
    });
  },

  /**
   * @param {SyntheticEvent} evt
   * @param {string} revisionHash
   * @private
   */
  onRevisionClick_: function(evt, revisionHash) {
    evt.preventDefault();

    if (revisionHash !== this.state.activeRevision) {
      repositoryActions.loadRevision(
          repositoryStore.getUserName(),
          repositoryStore.getRepositoryName(),
          revisionHash);
    }
  }
});


/**
 * @constructor
 * @extends {ReactComponent}
 * @private
 */
var Revision = React.createClass({
  getInitialState: function() {
    return {
      isClicked: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // NB! Immediate reaction to user's click on revision. While interacting with
    // server, revision doesn't highlighted after click so user might decide that
    // there's some lag.
    if (nextProps.isActive !== this.props.isActive) {
      this.setState({ isClicked: false });
    }
  },

  render: function() {
    var className = React.addons.classSet({
      'structure-revision': true,
      'structure-revision-active': this.props.isActive,
      'structure-revision-clicked': this.state.isClicked
    });

    return <div className={className} onClick={function(evt) {
        this.setState({ isClicked: true });
        this.props.onClick(evt);
      }.bind(this)}>
      {this.props.revision.commit.message}<br />
      <small>{this.props.revision.commit.committer.name},
      {new Date(this.props.revision.commit.committer.date).toLocaleString()}</small>
    </div>;
  }
});


module.exports = RepositoryStructure;
