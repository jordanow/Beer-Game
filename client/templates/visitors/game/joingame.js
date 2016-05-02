Template.joingame.onCreated(function() {
  let self = this;
  this.subscribe = Meteor.subscribe('Game.instances');
  this.subscribe = Meteor.subscribe('Game.sessions');
  self.positions = new ReactiveVar(['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer']);
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
        Meteor.call('getAvailablePositions', key, function(err, res) {
          if (err) {
            Bert.alert(err.message, 'danger');
          } else if (!res.success) {
            Bert.alert(res.message, 'danger');
          } else {
            tpl.positions.set(res.positionsAvailable);
            if (res.positionsAvailable.length === 0) {
              Bert.alert('Sorry! All the positions have been taken for this game');
            } else {
              $("#submitBtn").attr('disabled', false);
            }
          }
        });

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
        FlowRouter.go('/game/' + res.gamekey + '/player/' + res.playerkey);
      }
    });
  }
});