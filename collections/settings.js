Game = {};

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

let schema = new SimpleSchema({
  'cost.beer': {
    type: Number,
    label: 'Cost of beer',
    min: 0,
    max: 999999,
    decimal: true,
    defaultValue: 4
  },
  'cost.inventory': {
    type: Number,
    label: 'Cost of inventory',
    min: 0,
    max: 999999,
    decimal: true,
    defaultValue: 4
  },
  'cost.backlog': {
    type: Number,
    label: 'Cost of backlog',
    min: 0,
    max: 999999,
    decimal: true,
    defaultValue: 4
  },
  'maxfactoryoutput': {
    type: Number,
    label: 'Max output of factory',
    min: 0,
    max: 999999,
    decimal: true,
    defaultValue: 20
  },
  'customerdemand': {
    type: [Number],
    minCount: 4,
    maxCount: 56,
    min: 0,
    max: 999999,
    label: 'Sample customer demand per week'
  }
});

Game.settings.attachSchema(schema);
