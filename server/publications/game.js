Meteor.publish('Game.settings', function() {
  return Game.settings.find();
});

Meteor.publish('Game.sessions', function(number) {
  if (number) {
    check(number, String);
  }
  let q = {};

  if (number) {
    q.number = Number(number);
  }

  return Game.sessions.find(q);
});

Meteor.publish('Game.instances', function() {
  return Game.instances.find();
});

Meteor.publish('Game.players', function() {
  return Game.players.find();
});
