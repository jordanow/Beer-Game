Template.dashboardOverview.onCreated(function() {
  Template.instance().subscribe = Meteor.subscribe('Game.sessions');
  Template.instance().subscribe = Meteor.subscribe('Game.instances');
});

Template.dashboardOverview.helpers({
  pageLoading: function() {
    return !Template.instance().subscribe.ready();
  },
  sessions: function() {
    return Game.sessions.find();
  }
});

Template.dashboardOverview.events({
  'click .add-session': function(e) {
    e.preventDefault();
    Meteor.call('addSession');
  }
});
