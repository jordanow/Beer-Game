Meteor.methods({
  addSession: function() {
    let settings = Game.settings.findOne();
    return Game.sessions.insert({
      settings: settings
    });
  },
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

          let week = {
            player: {
              _id: playerId,
              role: player.role,
              week: 0,
              inventory: gameSession.settings.initialinventory
            }
          };

          Game.weeks.insert(week);

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
  getAvailablePositions: function(gamekey) {
    check(gamekey, String);
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
  createGames: function(options) {
    //Check if the session exists
    //If yes, create new games with same session id
    //else throw error
    check(options, {
      session: Number,
      numOfGames: Number
    });

    let session = Game.sessions.findOne({
      number: options.session
    });

    if (session && session._id) {
      for (let i = 0; i < options.numOfGames; i++) {
        Game.instances.insert({
          session: session._id
        });
      }
      return {
        success: true
      };
    } else {
      throw new Meteor.Error(400, 'Session not found');
    }


  },
  updateGameSettings: function(doc, docId) {
    check(doc, Object);
    check(docId, String);

    return Game.settings.update({
      _id: docId
    }, doc);
  },
  updateSessionSettings: function(doc, docId) {
    check(doc, Object);
    check(docId, String);

    return Game.sessions.update({
      _id: docId
    }, doc);
  },
  submitOrder: function(options) {
    check(options, {
      outOrder: Number,
      player: Object,
      instance: Object
    });

    let gameSession = getGameSession(options.instance.session);
    let gameSettings = gameSession.settings;
    let prevWeek = getPrevWeekDetails(options.player._id);

    let inDelivery = getIncomingDelivery(player.role, gameSession);
    let availableInventory = inDelivery + prevWeek.inventory;
    let inOrder = getIncomingOrder(player.role, gameSession);
    let toShip = prevWeek.backorder + inOrder;
    let outDelivery = toShip > availableInventory ? availableInventory : toShip;
    let backorder = toShip - outDelivery;
    let currentInventory = availableInventory - outDelivery;
    let currentCost = calculateCostForWeek(backorder, inventory, prevWeek.cost, gameSettings);

    let week = {
      player: {
        _id: options.player._id,
        role: options.player.role
      },
      week: (prevWeek.week + 1),
      delivery: { in : inDelivery,
        out: outDelivery
      },
      order: { in : inOrder,
        out: outOrder
      },
      backorder: backorder,
      inventory: prevWeek.inventory + inDelivery,
      cost: currentCost
    };

    return Game.weeks.insert(week);
  }
});

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
  let seller = getPlayerDetails(sellerRole, sessionId);

  if (role !== sellerRole) {
    let sellerPrevWeek = getPrevWeekDetails(seller._id);
    return sellerPrevWeek.delivery.out;
  } else {
    //This guy is a manufacturer
    return getManufacturerDelivery(seller, session.delay);
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

let getIncomingOrder = function(role, session) {

};

let calculateBackorder = function() {

};

let calculateCostForWeek = function(backorder, inventory, prevWeekCost, settings) {
  return prevWeekCost + (backorder * settings.cost.backorder) + (inventory * settings.cost.inventory);
};

let getPlayerDetails = function(role, sessionId) {
  return Game.players.findOne({
    role: role,
    'game.session': sessionId
  });
};

let getPrevWeekDetails = function(playerId) {
  return Game.weeks.findOne({
    'player._id': playerId
  }, {
    sort: {
      week: -1
    }
  });
};

let isValidRole = function(gamekey, role) {
  let positionsAvailable = getAvailablePositions(gamekey);
  return positionsAvailable.indexOf(role) >= 0;
};

let getAvailablePositions = function(gamekey) {
  let gameInstance = Game.instances.findOne({
    key: Number(gamekey)
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
