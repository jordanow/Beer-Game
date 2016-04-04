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
  number: {
    type: Number,
    autoValue: function() {
      console.log(this);
      if (this.isInsert) {
        return incrementCounter("playerKey", "number");
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

Game.instances.attachSchema(schema);
