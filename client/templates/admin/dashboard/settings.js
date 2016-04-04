Template.dashboardSettings.onCreated(function() {
  Template.instance().subscribe('Game.settings');
});

Template.dashboardSettings.helpers({
  settings: function() {
    return Game.settings.findOne();
  }
});

Template.dashboardSettings.events({
  'click .modal-create-games': function(e) {
    e.preventDefault();
    Modal.show('createGames');
  },
  'submit .adminSettingsForm': function(e) {
    e.preventDefault();

    let target = e.target;
    let options = {
      inventorycost: target.inventorycost.value,
      backlogcost: target.backlogcost.value,
      maxfactoryoutput: target.maxfactoryoutput.value,
      chaindelay: target.chaindelay.value,
      customerdemand: target.value
    };

    Meteor.call();
  }
});

AutoForm.addHooks(['gameSettings'], {
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
