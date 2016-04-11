Template.playgame.onCreated(function() {
  let self = this;

  self.subscription = Meteor.subscribe('Game.players', FlowRouter.getParam('playerkey'));
  self.subscription = Meteor.subscribe('Game.instances', FlowRouter.getParam('gamekey'));
  self.subscription = Meteor.subscribe('Game.weeks', FlowRouter.getParam('playerkey'));

  self.timeRemaining = new ReactiveVar(200);

  self.interval = Meteor.setInterval(function() {
    let remaining = self.timeRemaining.get();
    remaining -= 1;
    self.timeRemaining.set(remaining);

    if (remaining <= 0) {
      Meteor.clearInterval(self.interval);
    }
  }, 1000);
});

Template.playgame.helpers({
  game: function() {
    return Game.instances.findOne({
      key: Number(FlowRouter.getParam('gamekey'))
    });
  },
  player: function() {
    return Game.players.findOne({
      number: Number(FlowRouter.getParam('playerkey'))
    });
  },
  timeRemaining: function() {
    return Template.instance().timeRemaining.get();
  },
  weeks: function() {
    let player = Game.players.findOne({
      number: Number(FlowRouter.getParam('playerkey'))
    });
    if (player && player._id) {
      return Game.weeks.find({
        'player._id': player._id
      });
    }
  }
});

Template.playgame.events({
  'submit .orderOfThisWeek': function(e) {
    e.preventDefault();

    let options = {};
    options.outOrder = Number(e.target.outOrder.value) || 0;
    options.player = Game.players.findOne({
      number: Number(FlowRouter.getParam('playerkey'))
    });
    options.instance = Game.instances.findOne({
      key: Number(FlowRouter.getParam('gamekey'))
    });

    Meteor.call('submitOrder', options, function(err) {
      if (err) {
        Bert.alert(err.message, 'danger');
      }
    });
  }
});
