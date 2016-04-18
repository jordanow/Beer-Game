Meteor.publish('Game.settings', function() {
  return Game.settings.find();
});

Meteor.publish('currentSession', function(options) {
  check(options, Object);
  let player = Game.players.findOne({
    number: Number(options.playerkey)
  });

  return Game.sessions.find({
    _id: player.game.session
  });

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

Meteor.publish('Game.instances', function(gamekey) {
  if (gamekey) {
    check(gamekey, String);
  }
  let q = {};

  if (gamekey) {
    q.key = Number(gamekey);
  }
  return Game.instances.find(q);
});

Meteor.publish('Game.players', function(playerkey) {
  if (playerkey) {
    check(playerkey, String);
  }
  let q = {};

  if (playerkey) {
    q.number = Number(playerkey);
  }
  return Game.players.find(q);
});

Meteor.publish('Game.weeks', function(playerkey) {
  if (playerkey) {
    check(playerkey, String);
  }
  let q = {
    player: {
      _id: null,
      role: null
    }
  };

  if (playerkey) {
    let player = Game.players.findOne({
      number: Number(playerkey)
    });
    if (!!player && !!player._id) {
      q.player._id = player._id;
      q.player.role = player.role;
    }
  }
  return Game.weeks.find(q);
});
