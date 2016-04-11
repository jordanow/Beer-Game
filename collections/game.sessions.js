Game.sessions = new Meteor.Collection('game.sessions');

Game.sessions.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Game.sessions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

gamesettingsschema = new SimpleSchema({
  'initialinventory': {
    type: Number,
    label: 'Initial level of inventory',
    min: 0,
    max: 999999,
    decimal: true,
    defaultValue: 15
  },
  'cost.inventory': {
    type: Number,
    label: 'Cost of inventory',
    min: 0,
    max: 999999,
    decimal: true,
    defaultValue: 4
  },
  'cost.backorder': {
    type: Number,
    label: 'Cost of backorder',
    min: 0,
    max: 999999,
    decimal: true,
    defaultValue: 4
  },
  'customerdemand': {
    type: [Number],
    minCount: 4,
    maxCount: 56,
    min: 0,
    max: 999999,
    label: 'Sample customer demand per week',
    optional: true
  },
  delay: {
    type: Number,
    label: 'Weeks delay in supply chain',
    min: 1,
    max: 999999,
    defaultValue: 1
  },
  createdAt: {
    type: Date,
    label: "Created at",
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      } else {
        this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    label: "Updated at",
    autoValue: function() {
      return new Date();
    }
  }
});

let schema = new SimpleSchema({
  number: {
    type: Number,
    autoValue: function() {
      if (this.isInsert) {
        return incrementCounter("sessionKey", "number");
      }
    }
  },
  createdAt: {
    type: Date,
    label: "Created at",
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      } else {
        this.unset();
      }
    }
  },
  settings: {
    type: gamesettingsschema
  }
});

Game.sessions.attachSchema(schema);
