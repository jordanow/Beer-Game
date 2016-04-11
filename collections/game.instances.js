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
