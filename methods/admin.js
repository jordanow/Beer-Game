Meteor.methods({
  deleteSession: function(sessionnumber) {
    check(sessionnumber, String);
    if (Meteor.userId) {
      let gameSession = Game.sessions.findOne({
        number: Number(sessionnumber)
      });

      if (gameSession && gameSession._id) {
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
