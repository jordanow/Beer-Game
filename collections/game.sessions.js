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

DemandSchema = new SimpleSchema({
  week: {
    type: Number,
    label: 'Week',
    min: 1,
    max: 56
  },
  value: {
    type: Number,
    min: 0,
    max: 999999
  }
});

gamesettingsschema = new SimpleSchema({
  'initialinventory': {
    type: Number,
    label: 'Initial level of inventory',
    min: 0,
    max: 999999,
    defaultValue: 15
  },
  'cost.inventory': {
    type: Number,
    label: 'Cost of inventory',
    min: 0,
    max: 999999,
    defaultValue: 4
  },
  'cost.backorder': {
    type: Number,
    label: 'Cost of backorder',
    min: 0,
    max: 999999,
    defaultValue: 4
  },
  'customerdemand': {
    type: [DemandSchema],
    minCount: 4,
    maxCount: 56,
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
  key: {
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
  name: {
    type: String,
    optional: true
  },
  settings: {
    type: gamesettingsschema
  }
});

Game.sessions.attachSchema(schema);

Game.sessions.helpers({
  fullName() {
    return (this.name ? this.name + ' - ' + this.key : 'Session ' + this.key);
  },
  shortName() {
    return this.name ? this.name : 'Session ' + this.key
  }
});