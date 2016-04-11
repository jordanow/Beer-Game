Template.sessionOverview.onCreated(function() {
  Template.instance().subscribe = Meteor.subscribe('Game.sessions', FlowRouter.getParam('sessionNumber'));
  Template.instance().subscribe = Meteor.subscribe('Game.instances');
});

Template.sessionOverview.helpers({
  instances: function() {
    let session = Game.sessions.findOne({
      number: Number(FlowRouter.getParam('sessionNumber'))
    });

    if (session && session._id) {
      return Game.instances.find({
        session: session._id
      });
    }
  }
});

Template.sessionOverview.events({
  'click .modal-create-games': function(e) {
    e.preventDefault();
    Modal.show('createGames');
  },
  'click .modal-session-settings': function(e) {
    e.preventDefault();
    Modal.show('sessionSettings');
  }
});
