Meteor.startup(() => Modules.both.startup());


SEO = new FlowRouterSEO({
  database: true,
  databaseName: 'seo'
});

SEO.setDefaults({
  title: 'Beer Game',
  description: 'A simple game to learn Supply Chain Management'
});
