Template.joingame.onCreated(function() {
  let self = this;
  Meteor.subscribe('Game.instances');
  self.positions = new ReactiveVar(['Retailer', 'Manufacturer', 'Wholesaler', 'Distributor']);
});

Template.joingame.helpers({
  positionsAvailable: function() {
    return Template.instance().positions.get();
  }
});

Template.joingame.events({
  'focusout .gamekeyselect': function(e, tpl) {
    e.preventDefault();
    let key = e.target.value;

    Meteor.call('isValidGameKey', key, function(err, res) {

      if (err) {
        Bert.alert(err.message, 'danger');
      } else if (!res.success) {
        $("#gamekeybox").addClass('has-error');
        $("#submitBtn").attr('disabled', true);
      } else {
        $("#gamekeybox").removeClass('has-error');
        $("#gamekeybox").addClass('has-success');
        $("#submitBtn").attr('disabled', false);
      }
    });
  },
  'submit form.joingame': function(e) {
    e.preventDefault();
    let options = {
      key: e.target.gamekey.value,
      position: e.target.gameposition.value
    };

    Meteor.call('joingame', options, function(err, res) {
      if (err) {
        Bert.alert(err.message, 'danger');
      } else if (!res.success) {
        Bert.alert(res.message, 'danger');
      } else {
        Bert.alert('Accepted', 'success');
        FlowRouter.go('/game/' + res.gamekey);
      }
    });
  }
});
