Template.joingame.onCreated(function() {
  let self = this;
});

Template.joingame.helpers({
  positionsAvailable: function() {
    return ['Retailer', 'Manufacturer', 'Wholesaler', 'Distributor'];
  }
});

Template.joingame.events({
  'focusout .gamekeyselect': function(e, tpl) {
    e.preventDefault();
    let key = e.target.value;

    Meteor.call('checkGameKey', key, function(err, res) {

      if (err) {
        Bert.alert(err.message, 'danger');
      } else if (!res.success) {
        $("#gamekeybox").addClass('has-error');
        $("#submitBtn").attr('disabled', true);
      } else {
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
