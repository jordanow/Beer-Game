Game.settings = new Meteor.Collection('game.settings');

Game.settings.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Game.settings.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

Game.settings.attachSchema(gamesettingsschema);
