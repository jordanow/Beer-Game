Game.weeks = new Meteor.Collection('game.weeks');

Game.weeks.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Game.weeks.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

let gameweeksschema = new SimpleSchema({
  'player._id': {
    type: String
  },
  'player.role': {
    type: String
  },
  'week': {
    type: Number,
    defaultValue: 0,
    min: 0,
    label: 'The current week'
  },
  'delivery.in': {
    type: Number,
    defaultValue: 0,
    min: 0,
    label: 'Order recieved from above the supply chain'
  },
  'delivery.out': {
    type: Number,
    optional: true,
    min: 0,
    label: 'Order delivered below in the supply chain'
  },
  'order.in': {
    type: Number,
    defaultValue: 0,
    min: 0,
    label: 'Order received from below the supply chain'
  },
  'order.out': {
    type: Number,
    optional: true,
    min: 0,
    label: 'Order sent above in the supply chain'
  },
  'backorder': {
    type: Number,
    defaultValue: 0,
    min: 0,
    label: 'Pending orders for the week'
  },
  'inventory': {
    type: Number,
    defaultValue: 0,
    min: 0,
    label: 'Current inventory levels'
  },
  'cost': {
    type: Number,
    defaultValue: 0,
    min: 0,
    label: 'Cost incurred for the week'
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

});

Game.weeks.attachSchema(gameweeksschema);
