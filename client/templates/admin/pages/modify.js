Template.adminEditPage.onCreated(function() {
  Template.instance().subscribe('pages');
  this.currentPage = new ReactiveVar();
});


Template.adminEditPage.helpers({
  page: function() {
    return Pages.findOne({
      slug: FlowRouter.getParam("slug")
    });
  }
});

AutoForm.addHooks(['adminEditPage'], {
  onSuccess: function(err, n) {
    if (n === 1) {
      Bert.alert('Page has been saved', 'success');
    } else {
      Bert.alert('Page could not be saved!', 'danger');
    }
  },
  onError: function(formType, error) {
    Bert.alert(error.message, 'danger');
  }
});
