Template.header.helpers({
  brandLink() {
    return FlowRouter.path('index');
  }
});

Template.header.events({
  'click .logout' () {
    Meteor.logout((error) => {
      if (error) {
        Bert.alert(error.reason, 'warning');
      } else {
        Bert.alert('Logged out!', 'success');
      }
    });
  }
});
