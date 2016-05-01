Template.stopgame.onCreated(function() {
	let game = this.data;
	let self = this;
	self.game = new ReactiveVar(game);
});

Template.stopgame.helpers({
	game: function() {
		return Template.instance().game.get();
	},
	session: function() {
		return FlowRouter.getParam('sessionNumber');
	}
});

Template.stopgame.events({
	'click .confirmstopgame': function(e, tpl) {
		e.preventDefault();

		Meteor.call('updategamestate', tpl.game.get()._id, 'closed');
		Modal.hide('stopgame');
	}
});