Game.instances = new Meteor.Collection('game.instances');

Game.instances.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Game.instances.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

let InstanceRoleSchema = new SimpleSchema({
  week: {
    type: Number,
    min: 0,
    optional: true
  },
  state: {
    type: String,
    allowedValues: ['available', 'joined'],
    optional: true
  },
  'player._id': {
    type: String,
    optional: true
  },
  'player.key': {
    type: Number,
    optional: true
  },
});

let schema = new SimpleSchema({
  key: {
    type: Number,
    autoValue: function() {
      if (this.isInsert) {
        return incrementCounter("gamekey", "number");
      }
    }
  },
  session: {
    type: String
  },
  state: {
    type: String,
    allowedValues: ['play', 'closed'],
    defaultValue: 'play'
  },
  Retailer: {
    type: InstanceRoleSchema,
    optional: true
  },
  Wholesaler: {
    type: InstanceRoleSchema,
    optional: true
  },
  Distributor: {
    type: InstanceRoleSchema,
    optional: true
  },
  Manufacturer: {
    type: InstanceRoleSchema,
    optional: true
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

Game.instances.after.update(function(userId, doc) {
  if (allInSameWeek(doc) && doc.state === 'play') {
    addNewWeek(doc.key, doc.Retailer.player.key);
    addNewWeek(doc.key, doc.Manufacturer.player.key);
    addNewWeek(doc.key, doc.Distributor.player.key);
    addNewWeek(doc.key, doc.Wholesaler.player.key);
  }
}, {
  fetchPrevious: false
});

Game.instances.attachSchema(schema);

let allInSameWeek = function(gameInstance) {
  if (gameInstance.Retailer && !!gameInstance.Distributor && !!gameInstance.Manufacturer && !!gameInstance.Wholesaler) {
    if (gameInstance.Retailer.week === gameInstance.Distributor.week && gameInstance.Manufacturer.week === gameInstance.Wholesaler.week && gameInstance.Retailer.week === gameInstance.Wholesaler.week) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};