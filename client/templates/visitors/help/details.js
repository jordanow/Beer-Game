Template.helpPage.onCreated(function() {
  let self = this;
  self.page = new ReactiveVar(self.data);
  Meteor.subscribe('pages');
});

Template.helpPage.helpers({
  page: function() {
    return Pages.findOne({
      slug: Template.instance().page.get()
    });
  }
});
