const authenticatedRoutes = FlowRouter.group({
  name: 'admin'
});

authenticatedRoutes.route('/dashboard', {
  name: 'Dashboard',
  action() {
    BlazeLayout.render('default', {
      yield: 'dashboard'
    });
  }
});

authenticatedRoutes.route('/dashboard/pages/:slug', {
  name: 'Help page - About',
  action() {
    BlazeLayout.render('default', {
      yield: 'adminEditPage'
    });
  }
});
