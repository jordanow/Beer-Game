Template.createGames.onCreated(function() {
  Meteor.subscribe('Game.sessions');
});

Template.createGames.helpers({
  sessions: function() {
    return Game.sessions.find();
  }
});

Template.createGames.events({
  'submit .creategameform': function(e) {
    e.preventDefault();

    let options = {
      numOfGames: Number(e.target.numOfGames.value),
      session: Number(e.target.gameSession.value)
    };

    Meteor.call('createGames', options, function(err, res) {
      if (err) {
        Bert.alert(err.message, 'danger');
      } else if (!res.success) {
        Bert.alert(res.message, 'danger');
      } else {
        Bert.alert('Games created', 'success');
        Modal.hide('createGames');
      }
    });
  }
});
