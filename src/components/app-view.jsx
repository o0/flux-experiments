/**
 * @fileoverview
 * @author igor.alexeenko (Igor Alekseenko)
 * @jsx React.DOM
 */
 
var React = require('react/addons');

/**
 * @constructor
 * @extends {ReactComponent}
 */
var AppView = React.createClass({
  render: function() {
    return (<div className='application-layout'>{'Hello, world'}</div>);
  }
});

module.exports = AppView;
