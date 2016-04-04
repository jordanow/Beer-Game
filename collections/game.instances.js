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

let roleOrders = new SimpleSchema({
  week: {
    type: Number
  },
  backlog: {
    type: Number,
    autoValue: function() {
      //=backlog
    }
  },
  inventory: {
    type: Number,
    autoValue: function() {
      //= inventory + incomingdelivery
    }
  },
  incomingdelivery: {
    type: Number
  },
  incomingorder: {
    type: Number
  },
  delivered: {
    type: Number,
    autoValue: function() {
      let self = this;
      //always Inventory - incomingorder

    }
  },
  outgoingorder: {
    type: Number,
    optional: true
  }
});

let schema = new SimpleSchema({
  team: {
    type: Number,
    autoValue: function() {
      if (this.isInsert) {
        return incrementCounter("teamNumber", "number");
      }
    }
  },
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
  // 'roles.retailer': {
  //   type: [roleOrders],
  //   minCount: 1
  // },
  // 'roles.wholesaler': {
  //   type: [roleOrders],
  //   minCount: 1
  // },
  // 'roles.distributor': {
  //   type: [roleOrders],
  //   minCount: 1
  // },
  // 'roles.manufacturer': {
  //   type: [roleOrders],
  //   minCount: 1
  // },
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

Game.instances.attachSchema(schema);
