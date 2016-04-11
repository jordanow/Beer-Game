Template.continuegame.onCreated(function() {
  let self = this;
  Meteor.subscribe('Game.instances');
  Meteor.subscribe('Game.players');
});

Template.continuegame.events({
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
  'focusout .playerkeyselect': function(e, tpl) {
    e.preventDefault();
    let playerkey = e.target.value;
    let gamekey = $("#gamekey").val();

    Meteor.call('isValidPlayerKey', {
      playerkey,
      gamekey
    }, function(err, res) {

      if (err) {
        Bert.alert(err.message, 'danger');
      } else if (!res.success) {
        $("#playerkeybox").addClass('has-error');
        $("#submitBtn").attr('disabled', true);
      } else {
        $("#playerkeybox").removeClass('has-error');
        $("#playerkeybox").addClass('has-success');
        $("#submitBtn").attr('disabled', false);
      }
    });
  },
  'submit form.continuegame': function(e) {
    e.preventDefault();
    let options = {
      gamekey: e.target.gamekey.value,
      playerkey: e.target.playerkey.value
    };

    Meteor.call('continuegame', options, function(err, res) {
      if (err) {
        Bert.alert(err.message, 'danger');
      } else if (!res.success) {
        Bert.alert(res.message, 'danger');
      } else {
        Bert.alert('Accepted', 'success');
        FlowRouter.go('/game/' + res.gamekey + '/player/' + options.playerkey);
      }
    });
  }
});
