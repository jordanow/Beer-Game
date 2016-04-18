Template.stopallgames.onCreated(function() {});

Template.stopallgames.helpers({
  session: function() {
    return FlowRouter.getParam('sessionNumber');
  }
});

Template.stopallgames.events({
  'click .confirmstopallgames': function(e) {
    e.preventDefault();

    Meteor.call('stopallgames', FlowRouter.getParam('sessionNumber'));
    Modal.hide('stopallgames');
  }
});
