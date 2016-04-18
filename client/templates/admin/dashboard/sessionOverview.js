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
      }, {
        sort: {
          createdAt: -1
        }
      }).fetch();
    }
  },
  canstopgames: function() {
    let session = Game.sessions.findOne({
      number: Number(FlowRouter.getParam('sessionNumber'))
    });

    if (session && session._id) {
      return Game.instances.find({
        session: session._id,
        state: 'play'
      }).count() > 0;
    } else {
      return false;
    }
  },
  session: function() {
    return Game.sessions.findOne({
      number: Number(FlowRouter.getParam('sessionNumber'))
    });
  },
  statehelper: function(state) {
    if (state === 'play') {
      return 'In progress';
    } else {
      return 'Stopped';
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
  },
  'click .stopallgames': function(e) {
    e.preventDefault();
    Modal.show('stopallgames');
  }
});
