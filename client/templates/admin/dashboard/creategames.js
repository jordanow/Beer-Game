Template.createGames.onCreated(function() {
  this.subscribe = Meteor.subscribe('Game.sessions', FlowRouter.getParam('sessionNumber'));
});

Template.createGames.helpers({
  session: function() {
    return Game.sessions.findOne({
      number: Number(FlowRouter.getParam('sessionNumber'))
    });
  }
});

Template.createGames.events({
  'submit .creategameform': function(e) {
    e.preventDefault();

    let options = {
      numOfGames: Number(e.target.numOfGames.value),
      session: Number(FlowRouter.getParam('sessionNumber'))
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
