Template.dashboardSettings.onCreated(function() {
  Template.instance().subscription = Template.instance().subscribe('Game.settings');
});

Template.dashboardSettings.helpers({
  settings: function() {
    return Game.settings.findOne();
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
