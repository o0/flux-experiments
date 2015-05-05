/** @jsx React.DOM */

require('./repository-structure.scss');
var React = require('react/addons');
var RepositoryActions = require('../actions/repository-actions');
var repositoryActions = RepositoryActions.getInstance();
var RepositoryForm = require('./repository-form.jsx');
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();


/**
 * @type {number}
 * @private
 */
var revisionSize_ = 0;


/**
 * @constructor
 * @extends {ReactComponent}
 */ 
var RepositoryStructure = React.createClass({
  getInitialState: function() {
    return {
      activeRevision: repositoryStore.getRevisionHash(),
      isNextPageAvailable: repositoryStore.isNextPageAvailable(),
      repositoriesList: repositoryStore.getRepositoriesList(),
      revisionsList: repositoryStore.getRevisionsList(),
      username: repositoryStore.getUserName()
    }
  },

  componentWillMount: function() {
    var temporaryDiv = document.createElement('div');
    var fakeRevision = {
      commit: { 
        committer: { name: '', date: new Date },
        message: '' 
      }
    };

    document.body.appendChild(temporaryDiv);
    var measureRevision = React.render(<Revision revision={fakeRevision} isHidden={true} />,
        temporaryDiv);

    revisionSize_ = measureRevision.getDOMNode().scrollHeight;

    React.unmountComponentAtNode(temporaryDiv);
    document.body.removeChild(temporaryDiv);
    temporaryDiv = null;
    fakeRevision = null;
  },

  componentDidMount: function() {
    repositoryStore.
        on(RepositoryStore.EventType.SET_REVISIONS_LIST, this.onSetRevisions_).
        on(RepositoryStore.EventType.SET_REVISION, this.onSetRevision_);

    window.addEventListener('resize', this.onResize_);
    this.calculatePageSize_();
  },

  componentWillUnmount: function() {
    repositoryStore.
        removeAllListeners(RepositoryStore.EventType.SET_REVISIONS_LIST).
        removeAllListeners(RepositoryStore.EventType.SET_REVISION);

    window.removeEventListener('resize', this.onResize_);
  },

  render: function() {
    return (<div className="structure">
      <div className="structure-repository structure-col"></div>
      <div className="structure-revisions structure-col">
        {this.state.revisionsList.map(function(revision) {
          return <Revision key={revision.sha} 
              isActive={this.state.activeRevision === revision.sha} 
              revision={revision} onClick={function(evt) {
                this.onRevisionClick_.call(this, evt, revision.sha);
              }.bind(this)} />
        }, this)}

        {this.state.isNextPageAvailable && this.state.revisionsList.length ? 
          <button type="button" className="structure-revisions-more" onClick={this.onMoreClick_}>Show more</button> :
          null}
      </div>
      <RevisionDetails />
    </div>);
  },

  /**
   * @private
   */
  onSetRevisions_: function() {
    this.setState({
      revisionsList: repositoryStore.getRevisionsList(),
      isNextPageAvailable: repositoryStore.isNextPageAvailable()
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
  },

  /**
   * @param {SyntheticEvent} evt
   * @private
   */
  onMoreClick_: function(evt) {
    evt.preventDefault();

    repositoryActions.loadRevisions(
        repositoryStore.getUserName(),
        repositoryStore.getRepositoryName(),
        repositoryStore.getRevisionsList().length);
  },

  /**
   * @param {Event} evt
   * @private
   */
  onResize_: function(evt) {
    this.calculatePageSize_();
  },

  /**
   * @private
   */
  calculatePageSize_: function() {
    var itemsPerPage = Math.ceil(this.getDOMNode().clientHeight / revisionSize_) - 1;
    repositoryActions.setPageSize(itemsPerPage);
  }
});


/**
 * @constructor
 * @extends {ReactComponent}
 * @private
 */
var Revision = React.createClass({
  getInitialState: function() {
    return { isClicked: false };
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

    return <div className={className} style={{ visibility: this.props.isHidden ? 'hidden' : 'visible' }} onClick={function(evt) {
        if (typeof this.props.onClick === 'function') {
          this.setState({ isClicked: true });
          this.props.onClick(evt);
        }
      }.bind(this)}>
      {this.props.revision.commit.message}<br />
      <small>{this.props.revision.commit.committer.name},
      {new Date(this.props.revision.commit.committer.date).toLocaleString()}</small>
    </div>;
  }
});


/**
 * @constructor
 * @extends {ReactComponent}
 * @private
 */
var RevisionDetails = React.createClass({
  getInitialState: function() {
    return {
      revision: repositoryStore.getRevision()
    }
  },

  render: function() {
    var className = React.addons.classSet({
      'structure-revision-details': true,
      'structure-col': true,
      'structure-revision-details-empty': this.state.revision == null
    });

    return (<div className={className}>{this.state.revision !== null ? '' : ''}</div>);
  }
});


module.exports = RepositoryStructure;
