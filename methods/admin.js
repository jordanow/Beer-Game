Meteor.methods({
  getChartData: function() {
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

      response.data.retailer = getRoleDemand('Retailer');
      response.data.wholesaler = getRoleDemand('Wholesaler');
      response.data.distributor = getRoleDemand('Distributor');
      response.data.manufacturer = getRoleDemand('Manufacturer');

      return response;

    } else {
      return [];
    }
  }
});

let getRoleDemand = function(role) {
  let games = Game.weeks.find({
    'player.role': role
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
