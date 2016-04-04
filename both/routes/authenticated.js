const checkLogin = () => {
  if (!Meteor.userId()) {
    FlowRouter.go('/');
  }
};

const authenticatedRoutes = FlowRouter.group({
  name: 'admin',
  prefix: '/admin',
  triggersEnter: [checkLogin]
});

authenticatedRoutes.route('/overview', {
  name: 'dashboardOverview',
  action() {
    BlazeLayout.render('default', {
      yield: 'dashboardOverview'
    });
  }
});

authenticatedRoutes.route('/settings', {
  name: 'dashboardSettings',
  action() {
    BlazeLayout.render('default', {
      yield: 'dashboardSettings'
    });
  }
});

authenticatedRoutes.route('/pages/:slug', {
  name: 'help-page',
  action() {
    BlazeLayout.render('default', {
      yield: 'adminEditPage'
    });
  }
});
