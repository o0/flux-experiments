/** @jsx React.DOM */

require('./repository-structure.scss');
var NavActions = require('../actions/nav-actions');
var navActions = NavActions.getInstance();
var React = require('react/addons');
var RepositoryActions = require('../actions/repository-actions');
var repositoryActions = RepositoryActions.getInstance();
var RepositoryForm = require('./repository-form.jsx');
var RepositoryStore = require('../stores/repository-store');
var repositoryStore = RepositoryStore.getInstance();
var utils = require('../utils/utils');


/**
 * @type {number}
 * @private
 */
var revisionSize_ = 0;


/**
 * @type {Object.<string, ReactComponent>}
 * @private
 */
var revisionsCache_ = {};


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
      revision: repositoryStore.getRevision(),
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
    repositoryStore.on(RepositoryStore.EventType.CHANGE, this.onStoreChange_);
    window.addEventListener('resize', this.onResize_);

    this.calculatePageSize_();
  },

  componentWillUnmount: function() {
    repositoryStore.removeListener(RepositoryStore.EventType.CHANGE, this.onStoreChange_);
    window.removeEventListener('resize', this.onResize_);
  },

  render: function() {
    var activeRevisionId = this.state.activeRevision ? this.state.activeRevision : 'nil';
    if (!revisionsCache_[activeRevisionId]) {
      revisionsCache_[activeRevisionId] = <RevisionDetails revision={this.state.revision} />;
    }

    var activeRevision = revisionsCache_[activeRevisionId];

    return (<div className="structure">
      <div className="structure-repository structure-col">
        {this.state.revisionsList.length ? <RepositoryForm isInline={true} /> : null}
      </div>
      <div className="structure-revisions structure-col">
        {this.state.revisionsList.map(function(revision) {
          return <Revision key={revision.sha} 
              isActive={this.state.activeRevision && this.state.activeRevision === revision.sha} 
              revision={revision} onClick={function(evt) {
                this.onRevisionClick_.call(this, evt, revision.sha);
              }.bind(this)} />;
        }, this)}

        {this.state.isNextPageAvailable && this.state.revisionsList.length ? 
          <button type="button" className="structure-revisions-more" onClick={this.onMoreClick_}>Show more</button> :
          null}
      </div>
      {activeRevision}
    </div>);
  },

  onStoreChange_: function() {
    this.setState({
      activeRevision: repositoryStore.getRevisionHash(),
      isNextPageAvailable: repositoryStore.isNextPageAvailable(),
      repositoriesList: repositoryStore.getRepositoriesList(),
      revision: repositoryStore.getRevision(),
      revisionsList: repositoryStore.getRevisionsList(),
      username: repositoryStore.getUserName()
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
      navActions.navigate(NavActions.NavActionType.REVISION,
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
    var itemsPerPage = Math.ceil(this.getDOMNode().clientHeight / revisionSize_) - 2;
    if (itemsPerPage <= 0) {
      itemsPerPage = 1;
    } 

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
    if (this.isMounted() && nextProps.isActive !== this.props.isActive) {
      this.setState({ isClicked: false });
    }
  },

  render: function() {
    var className = React.addons.classSet({
      'structure-revision': true,
      'structure-revision-active': this.props.isActive,
      'structure-revision-clicked': this.state.isClicked
    });

    return <div className={className} 
        style={{ visibility: this.props.isHidden ? 'hidden' : 'visible' }} 
        onClick={function(evt) {
          if (typeof this.props.onClick === 'function') {
            evt.preventDefault();

            this.setState({ isClicked: true });
            this.props.onClick(evt);
          }
        }.bind(this)}>
      {this.props.revision.commit.message}<br />
      <small>{this.props.revision.commit.committer.name},{' '}
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
  render: function() {
    var className = React.addons.classSet({
      'structure-revision-details': true,
      'structure-col': true,
      'structure-revision-details-empty': this.props.revision == null
    });

    var authorUrl = '';
    var authorPic = '';

    if (this.props.revision && this.props.revision.committer) {
      authorUrl = this.props.revision.committer.html_url;
      authorPic = this.props.revision.committer.avatar_url;
    }

    var el = this.props.revision === null ? 
      <div className={className} /> : 
      <div className={className}>
        {authorPic ? <img src={authorPic} width="30" height="30" className='structure-revision-details-avatar' /> : null}
        <div className="structure-revision-details-title">{this.props.revision.commit.message}</div>
        <div className="structure-revision-details-info">
          Changes committed {this.props.revision.commit.committer.date}{' '}
          {authorUrl ? (<span>by <a href={authorUrl}>{this.props.revision.commit.committer.name}</a></span>) : null}
        </div>
        <div className="structure-revision-details-stats">
          {this.props.revision.files.length} {this.props.revision.files.length % 10 === 1 ? 'file' : 'files'} changed
          {this.props.revision.stats.additions ? 
              <span className="structure-revision-details-stats-additions">+{this.props.revision.stats.additions}</span> : ''}
          {this.props.revision.stats.deletions ? 
              <span className="structure-revision-details-stats-deletions">–{this.props.revision.stats.deletions}</span> : ''}
        </div>

        {this.props.revision.files.map(function(file, index) {
          var className = React.addons.classSet({
            'structure-revision-details-file': true,
            'structure-revision-details-file-deleted': file.status === 'deleted',
            'structure-revision-details-file-added': file.status === 'modified'
          });

          return <div key={file.filename} className={className}>
            <div className="structure-revision-details-file-stats">
              {file.status === 'deleted' ? <span>Deleted </span> : ''}
              {file.status === 'added' ? <span>Added </span> : ''}
              <span className="structure-revision-details-file-stats-filename">{file.filename}</span>
              {' '}
              <span className="structure-revision-details-stats">
                {file.additions ? <span className="structure-revision-details-stats-additions">+{file.additions}</span> : ''}
                {file.deletions ? <span className="structure-revision-details-stats-deletions">–{file.deletions}</span> : ''}
              </span>
            </div>

            {file.status === 'modified' ? formatPatch(file.patch) : null}
          </div>
        }, this)}
      </div>;

    return el;
  }
});


/**
 * @type {number}
 * @private
 */
var fileCounter_ = 0;


/**
 * @param {string} code
 * @return {ReactComponent}
 */
var formatPatch = function(code) {
  var codeLines = code.split('\n');
  var lineClassName = new utils.ClassName('structure-revision-details-file-source');

  return <div className={lineClassName.getClassName()}>
    {codeLines.map(function(line, index) {
      var className = React.addons.classSet(utils.makeObject(
          lineClassName.getClassName('line'), true,
          lineClassName.getClassName('line', 'added'), /^\+/.test(line),
          lineClassName.getClassName('line', 'deleted'), /^\-/.test(line),
          lineClassName.getClassName('line', 'service'), /^@@/.test(line)));

      return <div className={className} 
          key={[fileCounter_++, 'file', index, 'line'].join()}>{line}</div>
    })}
  </div>
};


module.exports = RepositoryStructure;
