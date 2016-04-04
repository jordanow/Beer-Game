Meteor.publish('Game.settings', function() {
  return Game.settings.find();
});
