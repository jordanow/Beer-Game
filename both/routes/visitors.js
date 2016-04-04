const visitorRoutes = FlowRouter.group({
  name: 'visitor'
});

visitorRoutes.route('/', {
  name: 'index',
  action() {
    BlazeLayout.render('default', {
      yield: 'index'
    });
  }
});

visitorRoutes.route('/game/join', {
  name: 'joingame',
  action() {
    BlazeLayout.render('default', {
      yield: 'joingame'
    });
  }
});

visitorRoutes.route('/game/continue', {
  name: 'continuegame',
  action() {
    BlazeLayout.render('default', {
      yield: 'continuegame'
    });
  }
});

visitorRoutes.route('/game/:key', {
  name: 'playgame',
  action() {
    BlazeLayout.render('default', {
      yield: 'playgame'
    });
  }
});
