IdentityCounters = new Mongo.Collection('identitycounters');

IdentityCounters.attachSchema(new SimpleSchema({
  model: {
    type: String
  },
  field: {
    type: String
  },
  count: {
    type: Number,
    defaultValue: 1111
  }
}));

incrementCounter = function(model, field) {

  _incrementCount(model, field);
  return _getCounter(model).count;
};

_incrementCount = function(model, field) {
  let counter = _getCounter(model);

  if (counter) {
    IdentityCounters.update({
      model: model,
      field: field
    }, {
      $inc: {
        count: 1
      },
      $set: {
        field: field
      }
    });
  } else {
    IdentityCounters.insert({
      model: model,
      field: field
    });
  }
};

_getCounter = function(model) {
  return IdentityCounters.findOne({
    model: model
  });
};

//Allow/Deny - No client side ops allowed
IdentityCounters.allow({
  insert: function(userId, document) {
    return false;
  },
  update: function(userId, document, fields, modifier) {
    return false;
  },
  remove: function(userId, document) {
    return false;
  }
});

IdentityCounters.deny({
  insert: function(userId, document) {
    return true;
  },
  update: function(userId, document, fields, modifier) {
    return true;
  },
  remove: function(userId, document) {
    return true;
  }
});
