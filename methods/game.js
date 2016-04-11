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
      let gameInstance = getGameInstance(options.key);
      let newPlayer = {
        role: options.position,
        game: {
          instance: gameInstance._id,
          session: gameInstance.session
        },
        number: ''
      };
      let player = Game.players.insert(newPlayer);
      return {
        success: player,
        gamekey: gameInstance.key
      };
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
  submitOrder: function(options) {
    check(options, {
      outOrder: Number
    });

    return true;
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
  }
});

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
