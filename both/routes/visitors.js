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
