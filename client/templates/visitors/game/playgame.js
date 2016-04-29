Template.playgame.onCreated(function() {
  let self = this;

  self.subscription = Meteor.subscribe('Game.players', FlowRouter.getParam('playerkey'));
  self.subscription = Meteor.subscribe('Game.instances', FlowRouter.getParam('gamekey'));
  self.subscription = Meteor.subscribe('Game.weeks', FlowRouter.getParam('playerkey'));

  self.timeRemaining = new ReactiveVar(200);
  self.allplayersin = new ReactiveVar(false);
  self.gameIsAvailable = new ReactiveVar(false);

  self.joinInterval = Meteor.setInterval(function() {
    Meteor.call('getAvailablePositions', FlowRouter.getParam('gamekey'), function(err, res) {
      if (res && res.positionsAvailable && res.positionsAvailable.length === 0) {
        self.allplayersin.set(true);
        Meteor.clearInterval(self.joinInterval);
      }
    });
  }, 2000);

  self.interval = Meteor.setInterval(function() {
    let remaining = self.timeRemaining.get();
    remaining -= 1;
    self.timeRemaining.set(remaining);

    if (remaining <= 0) {
      Meteor.clearInterval(self.interval);
    }
  }, 1000);

  self.nextMoveInterval = Meteor.setInterval(function() {
    Meteor.call('makeNextMove', FlowRouter.getParam('gamekey'), FlowRouter.getParam('playerkey'), function(err, res) {
      if (res && res.success) {
        self.allplayersin.set(true);
        Meteor.clearInterval(self.nextMoveInterval);
      }
    });
  }, 2000);

});

Template.playgame.onDestroyed(function() {
  let instance = Template.instance();
  Meteor.clearInterval(instance.joinInterval);
  Meteor.clearInterval(instance.interval);
  Meteor.clearInterval(instance.nextMoveInterval);
});

Template.playgame.helpers({
  allplayersin: function() {
    return Template.instance().allplayersin.get();
  },
  game: function() {
    let game = Game.instances.findOne({
      key: Number(FlowRouter.getParam('gamekey'))
    });

    if (game) {
      return game;
    } else {
      Template.instance().gameIsAvailable.set(false);
    }
  },
  gameIsAvailable: function() {
    return Template.instance().gameIsAvailable.get();
  },
  player: function() {
    let player = Game.players.findOne({
      key: Number(FlowRouter.getParam('playerkey'))
    });
    if (player) {
      Template.instance().gameIsAvailable.set(true);
      return player;
    } else {
      Template.instance().gameIsAvailable.set(false);
    }

  },
  timeRemaining: function() {
    return Template.instance().timeRemaining.get();
  },
  weeks: function() {
    let player = Game.players.findOne({
      key: Number(FlowRouter.getParam('playerkey'))
    });
    if (player && player._id) {
      return Game.weeks.find({
        'player._id': player._id
      });
    }
  }
});

Template.playgame.events({
  'submit .orderOfThisWeek': function(e, tpl) {
    e.preventDefault();
    let options = {};
    options.outOrder = Number(e.target.outOrder.value) || 0;
    options.player = Game.players.findOne({
      key: Number(FlowRouter.getParam('playerkey'))
    });
    options.instance = Game.instances.findOne({
      key: Number(FlowRouter.getParam('gamekey'))
    });
    e.target.outOrder.value = '';

    Meteor.call('submitOrder', options, function(err) {
      if (err) {
        Bert.alert(err.message, 'danger');
      } else {
        tpl.allplayersin.set(false);
      }
    });
  }
});