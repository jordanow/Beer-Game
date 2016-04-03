Template.playgame.onCreated(function() {
  let self = this;
  //Get the time remaining from db
  self.timeRemaining = new ReactiveVar(200);

  self.interval = Meteor.setInterval(function() {
    let remaining = self.timeRemaining.get();
    remaining -= 1;
    self.timeRemaining.set(remaining);

    if (remaining < -1) {
      Meteor.clearInterval(self.interval);
    }
  }, 1000);
});

Template.playgame.helpers({
  position: function() {
    return 'Retailer';
  },
  maxDelivery: function() {
    return 4;
  },
  maxOutOrder: function() {
    return 10;
  },
  game: function() {
    return {
      team: 'Android1',
      week: 3,
    };
  },
  timeRemaining: function() {
    return Template.instance().timeRemaining.get();
  },
  current: function() {
    return {
      position: 'Retailer',
      thisWeek: {
        incomingDelivery: 4,
        incomingOrder: 5,
        inventory: 6
      },
      log: [{
        week: 0,
        incomingDelivery: 4,
        incomingOrder: 5,
        inventory: 6,
        backorder: 2,
        toShip: 4,
        order: 5,
        cost: 6
      }, {
        week: 1,
        incomingDelivery: 4,
        incomingOrder: 5,
        inventory: 6,
        backorder: 2,
        toShip: 4,
        order: 5,
        cost: 6
      }, {
        week: 2,
        incomingDelivery: 4,
        incomingOrder: 5,
        inventory: 6,
        backorder: 2,
        toShip: 4,
        order: 5,
        cost: 8
      }, {
        week: 3,
        incomingDelivery: 3,
        incomingOrder: 5,
        inventory: 6,
        backorder: 2,
        toShip: 4,
        order: 5,
        cost: 10
      }, {
        week: 4,
        incomingDelivery: 4,
        incomingOrder: 5,
        inventory: 6,
        backorder: 2,
        toShip: 4,
        order: 5,
        cost: 20
      }, {
        week: 5,
        incomingDelivery: 5,
        incomingOrder: 5,
        inventory: 6,
        backorder: 2,
        toShip: 4,
        order: 5,
        cost: 30
      }]
    };
  }
});

Template.playgame.events({
  'submit .orderOfThisWeek': function(e) {
    e.preventDefault();

    let outOrder = e.target.outOrder.value || 0;
    let options = {};
    options.outOrder = Number(outOrder);

    Meteor.call('submitOrder', options, function(err) {
      if (err) {
        Bert.alert(err.message, 'danger');
      }
    });
  }
});
