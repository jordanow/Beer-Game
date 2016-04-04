Meteor.publish('Game.settings', function() {
  return Game.settings.find();
});

Meteor.publish('Game.sessions', function() {
  return Game.sessions.find();
});

Meteor.publish('Game.instances', function() {
  return Game.instances.find();
});

Meteor.publish('Game.players', function() {
  return Game.players.find();
});
