const handleRedirect = (routes, redirect) => {
  let currentRoute = FlowRouter.getRouteName();
  if (routes.indexOf(currentRoute) > -1) {
    FlowRouter.go(redirect);
    return true;
  }
};

Template.default.helpers({
  loggingIn() {
    return Meteor.loggingIn();
  },
  authenticated() {
    return !Meteor.loggingIn() && Meteor.user();
  },
  redirectAuthenticated() {
    return handleRedirect([
      'login',
      'recover-password',
      'reset-password'
    ], '/admin/overview');
  },
  redirectPublic() {
    return handleRedirect([
      'dashboardOverview'
    ], '/login');
  }
});