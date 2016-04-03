Template.index.onCreated(() => {});

Template.index.events({
  'click .modal-toggle': function(e) {
    e.preventDefault();

    let page = null;
    switch (e.target.name) {
      case 'game-rules':
        page = 'game-rules';
        break;
      case 'about':
        page = 'about';
        break;
    }

    if (!!page) {
      Modal.show('helpPage', page);
    }
  }
});
