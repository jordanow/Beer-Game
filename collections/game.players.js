Game.players = new Meteor.Collection('game.players');

Game.players.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Game.players.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

let schema = new SimpleSchema({
  key: {
    type: Number,
    autoValue: function() {
      if (this.isInsert) {
        return incrementCounter("playerkey", "number");
      }
    }
  },
  role: {
    type: String,
    allowedValues: ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer']
  },
  'game.instance': {
    type: String
  },
  'game.session': {
    type: String
  }
});

Game.players.attachSchema(schema);