Meteor.methods({
  joingame: function(options) {
    check(options, {
      key: String,
      position: String
    });

    //Check if the game key is valid
    //Check if this position is available
    //If true, assign the position to this person
    //return success
    if (isValidGameKey(options.key)) {
      if (isValidRole(options.key, options.position)) {
        let gameInstance = getGameInstance(options.key);
        let gameSession = getGameSession(gameInstance.session);
        let newPlayer = {
          role: options.position,
          game: {
            instance: gameInstance._id,
            session: gameInstance.session
          },
          number: ''
        };
        let playerId = Game.players.insert(newPlayer);

        let player = {};
        if (playerId) {
          player = Game.players.findOne({
            _id: playerId
          });


          let inOrder = gameSession.settings.customerdemand[0];
          let availableInventory = gameSession.settings.initialinventory;
          let toShip = inOrder;
          let outDelivery = toShip > availableInventory ? availableInventory : toShip;
          let backorder = toShip - outDelivery;
          let currentInventory = availableInventory - outDelivery;

          let week0 = {
            game: {
              instance: gameInstance._id,
              session: gameInstance.session
            },
            player: {
              _id: playerId,
              role: player.role,
              number: player.number
            },
            week: 0,
            order: {
              "in": 0,
              "out": 0
            },
            delivery: {
              "in": 0,
              "out": 0
            },
            cost: 0,
            inventory: availableInventory
          };

          let week1 = {
            game: {
              instance: gameInstance._id,
              session: gameInstance.session
            },
            player: {
              _id: playerId,
              role: player.role,
              number: player.number
            },
            week: 1,
            order: {
              "in": 0
            },
            delivery: {
              "in": 0,
              "out": 0
            },
            inventory: availableInventory
          };

          if (player.role === 'Retailer') {
            week1.order.in = gameSession.settings.customerdemand[0];
            week1.delivery.out = outDelivery;
            week1.inventory = currentInventory;
          }

          Game.weeks.insert(week0);
          Game.weeks.insert(week1);

          return {
            success: playerId,
            gamekey: gameInstance.key,
            playerkey: player && player.number ? player.number : false
          };
        } else {
          return {
            success: false,
            message: 'Error while joining game. Please try again!'
          };
        }
      } else {
        return {
          success: false,
          message: 'Selected role has already been taken!'
        };
      }
    } else {
      return {
        success: false,
        message: 'The provided key is incorrect'
      };
    }
  },
  continuegame: function(options) {
    check(options, {
      gamekey: String,
      playerkey: String
    });

    //Check if the game key is valid
    //Check if this position is available
    //If true, assign the position to this person
    //return success
    if (isValidGameKey(options.gamekey)) {
      let gameInstance = getGameInstance(options.gamekey);

      let player = Game.players.findOne({
        number: Number(options.playerkey),
        game: {
          instance: gameInstance._id,
          session: gameInstance.session
        }
      });

      if (!!player) {
        return {
          success: player,
          gamekey: gameInstance.key
        };
      } else {
        throw new Meteor.Error(400, 'Player key not found');
      }
    } else {
      return {
        success: false,
        message: 'The provided key is incorrect'
      };
    }
  },
  isValidGameKey: function(key) {
    check(key, String);
    if (key) {

      return {
        success: isValidGameKey(key)
      };
    } else {
      return {
        success: false
      };
    }
  },
  makeNextMove: function(gamekey, playerkey) {
    check(gamekey, Match.Optional(String));
    check(playerkey, Match.Optional(String));

    if (Meteor.isServer) {
      if (!!gamekey && !!playerkey) {
        if (isValidGameKey(gamekey)) {
          if (allInSameWeek(gamekey)) {
            return {
              success: addNewWeek(gamekey, playerkey)
            };
          } else {
            return {
              success: false
            };
          }
        } else {
          return {
            success: false,
            message: 'Incorrect game key!'
          };
        }
      } else {
        return {
          success: false,
          message: 'Game key is required!'
        };
      }
    } else {
      return;
    }
  },
  getAvailablePositions: function(gamekey) {
    check(gamekey, Match.Optional(String));
    if (!!gamekey) {
      if (isValidGameKey(gamekey)) {
        return {
          success: true,
          positionsAvailable: getAvailablePositions(gamekey)
        };
      } else {
        return {
          success: false,
          message: 'Incorrect game key!'
        };
      }
    } else {
      return {
        success: false,
        message: 'Game key is required!'
      };
    }
  },
  isValidPlayerKey: function(options) {
    check(options, Object);
    let gameInstance = Game.instances.findOne({
      key: Number(options.gamekey)
    });
    let player = {};

    if (!!gameInstance && gameInstance._id) {
      player = Game.players.findOne({
        'game.instance': gameInstance._id,
        number: Number(options.playerkey)
      });
    }

    return {
      success: player && player._id
    };
  },

  allInSameWeek: function(gamekey) {
    if (Meteor.isServer) {
      check(gamekey, Match.Optional(String));
      if (!!gamekey && isValidGameKey(gamekey)) {
        return allInSameWeek(gamekey);
      }
    }
  },
  submitOrder: function(options) {
    if (Meteor.isServer) {
      check(options, Object);
      let gameSession = getGameSession(options.instance.session);
      let gameSettings = gameSession.settings;

      let currentWeek = getCurrentWeekDetails(options.player._id);
      let prevWeek = getPreviousWeekDetails(options.player._id);

      let inDelivery = getIncomingDelivery(options.player.role, gameSession);
      let availableInventory = inDelivery + prevWeek.inventory;
      let inOrder = getIncomingOrder(options.player.role, gameSession, options.instance);

      let toShip = prevWeek.backorder + inOrder;
      let outDelivery = toShip > availableInventory ? availableInventory : toShip;
      let backorder = toShip - outDelivery;
      let currentInventory = availableInventory - outDelivery;


      let currentCost = calculateCostForWeek(gameSettings, backorder, currentInventory, prevWeek.cost);

      let week = {
        'order.out': options.outOrder,
        cost: currentCost,
        'delivery.out': outDelivery,
        inventory: currentInventory,
        backorder: backorder
      };

      return Game.weeks.update({
        _id: currentWeek._id
      }, {
        $set: week
      });
    }
  }
});

let addNewWeek = function(gamekey, playerkey) {
  //For the player add a new week
  //For retailer -> order in comes from settings
  //For Distributor -> order in comes from retailer's prev order out
  //For Wholesaler -> order in comes from distributor's prev order out
  //For Manufacturer -> order in comes from wholesaler's prev order out
  //
  //Also, find the delivery in for all the people
  //For retailer -> delivery in comes from distributor's prev delivery out
  //For Distributor -> delivery in comes from distributor's prev delivery out
  //For Wholesaler -> delivery in comes from Manufacturer's prev delivery out
  //For Manufacturer -> delivery in comes from Manufacturer's (prev*delay)order out

  //Bugs:
  //Wholesaler's order in is becoming delivery in
  //Manufacturer's week is not added
  //Always check if the player can make next move or not

  if (Meteor.isServer) {
    let gameInstance = getGameInstance(gamekey);
    let gameSession = getGameSession(gameInstance.session);

    let player = Game.players.findOne({
      number: Number(playerkey),
      'game.instance': gameInstance._id
    });

    let prevWeek = getPreviousWeekDetails(player._id);

    //New order must be created only if the previous weeks order was submitted
    let inDelivery = getIncomingDelivery(player.role, gameSession);
    let inOrder = getIncomingOrder(player.role, gameSession, gameInstance);

    let week = {
      week: getCurrentWeek(gameInstance._id) + 1,
      delivery: {
        "in": inDelivery
      },
      order: {
        "in": inOrder
      },
      backorder: prevWeek.backorder + inOrder,
      inventory: prevWeek.inventory + inDelivery,
      game: {
        instance: gameInstance._id,
        session: gameInstance.session
      },
      player: {
        _id: player._id,
        role: player.role,
        number: player.number
      }
    };

    console.log(week);
    return Game.weeks.insert(week);
  }

};


let getCustomerRole = function(myRole) {
  let customer = null;
  switch (myRole) {
    case 'Retailer':
      customer = 'Customer';
      break;
    case 'Distributor':
      customer = 'Retailer';
      break;
    case 'Wholesaler':
      customer = 'Distributor';
      break;
    case 'Manufacturer':
      customer = 'Wholesaler';
      break;
  }
  return customer;
};

let getSellerRole = function(myRole) {
  let seller = null;
  switch (myRole) {
    case 'Retailer':
      seller = 'Distributor';
      break;
    case 'Distributor':
      seller = 'Wholesaler';
      break;
    case 'Wholesaler':
      seller = 'Manufacturer';
      break;
    default:
      seller = 'Manufacturer';
  }
  return seller;
};

let getIncomingDelivery = function(role, session) {
  let sellerRole = getSellerRole(role);
  let seller = getPlayerDetails(sellerRole, session._id);

  if (role !== sellerRole) {
    let sellerPrevWeek = getCurrentWeekDetails(seller._id);
    return sellerPrevWeek.delivery.out || 0;
  } else {
    //This guy is a manufacturer
    return getManufacturerDelivery(seller, session.delay) || 0;
  }
};

let getManufacturerDelivery = function(manufacturer, delay) {
  let manufacturerWeeks = Game.weeks.find({
    'player._id': manufacturer._id
  }, {
    sort: {
      week: -1
    }
  }).fetch();

  if (!!manufacturerWeeks && manufacturerWeeks.length >= delay) {
    return manufacturerWeeks[delay].order.out;
  } else {
    return 0;
  }

};

let getIncomingOrder = function(role, session, instance) {
  let customerRole = getCustomerRole(role);

  if (customerRole === 'Customer') {
    //get from game settings
    return session.settings.customerdemand[getCurrentWeek(instance._id)];
  } else {
    let customer = getPlayerDetails(customerRole, session._id);
    let customerPrevWeek = getCurrentWeekDetails(customer._id);
    return customerPrevWeek.order.out || 0;
  }
};

let getCurrentWeek = function(instanceId) {
  let gameweeks = Game.weeks.find({
    'game.instance': instanceId
  }).fetch();

  let weeks = [];

  gameweeks.forEach(function(w) {
    weeks.push(w.week);
  });

  weeks = weeks.sort();

  return weeks[0];
};

let calculateCostForWeek = function(settings, backorder = 0, inventory = 0, prevWeekCost = 0) {
  return prevWeekCost + (backorder * settings.cost.backorder) + (inventory * settings.cost.inventory);
};

let getPlayerDetails = function(role, sessionId) {
  return Game.players.findOne({
    role: role,
    'game.session': sessionId
  });
};

let getCurrentWeekDetails = function(playerId) {
  return Game.weeks.findOne({
    'player._id': playerId
  }, {
    sort: {
      week: -1
    }
  });
};

let getPreviousWeekDetails = function(playerId) {
  let weeks = Game.weeks.find({
    'player._id': playerId
  }, {
    sort: {
      week: -1
    }
  }).fetch();

  if (!!weeks) {
    if (weeks.length > 1) {
      return weeks[1];
    } else {
      return weeks[0];
    }
  }
};

let isValidRole = function(gamekey, role) {
  let positionsAvailable = getAvailablePositions(gamekey);
  return positionsAvailable.indexOf(role) >= 0;
};

let getAvailablePositions = function(gamekey) {
  let gameInstance = Game.instances.findOne({
    key: Number(gamekey)
      // ,
      // state: 'play'
  });
  let players = Game.players.find({
    'game.instance': gameInstance._id
  }).fetch();

  let positionsAvailable = ['Retailer', 'Manufacturer', 'Wholesaler', 'Distributor'];
  let positionsTaken = [];

  players.forEach(function(player) {
    if (!!player && player.role) {
      positionsTaken.push(player.role);
    }
  });

  return _.difference(positionsAvailable, positionsTaken);
};

let allInSameWeek = function(gamekey) {
  let gameInstance = Game.instances.findOne({
    key: Number(gamekey)
  });

  let Retailer = Game.players.findOne({
    'game.instance': gameInstance._id,
    role: 'Retailer'
  });


  let RetailerWeek = getCurrentWeekDetails(Retailer._id);
  if (!!RetailerWeek) {
    return Game.weeks.find({
      'game.instance': gameInstance._id,
      week: RetailerWeek.week,
      "order.out": {
        $exists: true
      }
    }).count() === 4;
  } else {
    return true;
  }
};

let getGameSession = function(sessionId) {
  return Game.sessions.findOne({
    _id: sessionId
  });
};

let getGameInstance = function(key) {
  return Game.instances.findOne({
    key: Number(key)
  });
};

let isValidGameKey = function(key) {
  let count = Game.instances.find({
    key: Number(key)
  }).count();

  return count === 1;
};