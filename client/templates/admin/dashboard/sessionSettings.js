Template.sessionSettings.onCreated(function() {
  this.subscribe = Meteor.subscribe('Game.sessions', FlowRouter.getParam('sessionNumber'));
});

Template.sessionSettings.helpers({
  session: function() {
    return Game.sessions.findOne({
      key: Number(FlowRouter.getParam('sessionNumber'))
    });
  }
});

AutoForm.addHooks(['sessionSettings'], {
  onSuccess: function(err, n) {
    if (n === 1) {
      Bert.alert('Settings have been saved', 'success');
    } else {
      Bert.alert('Settings could not be saved!', 'danger');
    }
  },
  onError: function(formType, error) {
    Bert.alert(error.message, 'danger');
  }
});