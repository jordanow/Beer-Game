Meteor.methods({
  createGames: function(options) {
    //Check if the session exists
    //If yes, create new games with same session id
    //else throw error
    check(options, {
      session: Number,
      numOfGames: Number
    });

    let session = Game.sessions.findOne({
      key: options.session
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

    doc.$set['customerdemand'] = _.filter(doc.$set['customerdemand'], function(i) {
      return !!i && parseInt(i.week) >= 0 && i.value;
    });

    doc.$set['customerdemand'] = _.sortBy(doc.$set['customerdemand'], function(i) {
      return parseInt(i.week);
    });

    return Game.settings.update({
      _id: docId
    }, doc);
  },
  updateSessionSettings: function(doc, docId) {
    check(doc, Object);
    check(docId, String);

    doc.$set['settings.customerdemand'] = _.filter(doc.$set['settings.customerdemand'], function(i) {
      return !!i && parseInt(i.week) >= 0 && i.value;
    });

    doc.$set['settings.customerdemand'] = _.sortBy(doc.$set['settings.customerdemand'], function(i) {
      return parseInt(i.week);
    });
    return Game.sessions.update({
      _id: docId
    }, doc);
  },
  addSession: function() {
    let settings = Game.settings.findOne();
    return Game.sessions.insert({
      settings: settings
    });
  },
  resumeallgames: function(sessionNumber) {
    check(sessionNumber, String);
    let session = Game.sessions.findOne({
      key: Number(sessionNumber)
    });

    if (session) {
      return Game.instances.update({
        state: 'closed'
      }, {
        $set: {
          state: 'play'
        }
      }, {
        multi: true
      });
    } else {
      throw new Meteor.Error(403, 'Session not found');
    }
  },
  stopallgames: function(sessionNumber) {
    check(sessionNumber, String);
    let session = Game.sessions.findOne({
      key: Number(sessionNumber)
    });

    if (session) {
      return Game.instances.update({
        state: 'play'
      }, {
        $set: {
          state: 'closed'
        }
      }, {
        multi: true
      });
    } else {
      throw new Meteor.Error(403, 'Session not found');
    }

  },
  deleteSession: function(sessionnumber) {
    check(sessionnumber, String);
    if (Meteor.userId) {
      let gameSession = Game.sessions.findOne({
        key: Number(sessionnumber)
      });

      if (gameSession && gameSession._id) {
        let instancesInPlay = Game.instances.find({
          session: gameSession._id,
          state: 'play'
        }).count();

        if (instancesInPlay > 0) {
          throw new Meteor.Error(403, 'Games are in session. Please stop all the games to continue.');
        }

        Game.weeks.remove({
          'game.session': gameSession._id
        });
        Game.players.remove({
          'game.session': gameSession._id
        });
        Game.instances.remove({
          session: gameSession._id
        });
        Game.sessions.remove({
          _id: gameSession._id
        });
      }
      return;
    } else {
      return;
    }
  },
  getChartData: function(instanceId) {
    check(instanceId, String);

    if (Meteor.userId && Meteor.isServer) {
      let response = {
        success: true,
        data: {
          retailer: [],
          wholesaler: [],
          distributor: [],
          manufacturer: []
        }
      };

      response.data.retailer = getRoleDemand('Retailer', instanceId);
      response.data.wholesaler = getRoleDemand('Wholesaler', instanceId);
      response.data.distributor = getRoleDemand('Distributor', instanceId);
      response.data.manufacturer = getRoleDemand('Manufacturer', instanceId);

      return response;

    } else {
      return [];
    }
  }
});

let getRoleDemand = function(role, instanceId) {
  let games = Game.weeks.find({
    'player.role': role,
    'game.instance': instanceId
  }).fetch();

  if (games && games.length > 0) {
    let demand = [];

    games.forEach(function(game) {
      if (game.order && game.order.out)
        demand.push(game.order.out);
    });

    return demand;
  } else {
    return [];
  }

};