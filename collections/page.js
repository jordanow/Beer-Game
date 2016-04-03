Pages = new Mongo.Collection('pages');

SimpleSchema.messages({
  "unique-title": "Please enter unique title"
});

Pages.attachSchema(new SimpleSchema({
  title: {
    type: String,
    max: 100,
    custom: function() {
      let self = this;
      let page = {};

      if (!self.docId) {
        page = Pages.findOne({
          slug: URLify2(self.value)
        });
      }

      if (page && page.slug) {
        return 'unique-title';
      }
    },
    trim: true
  },
  slug: {
    type: String,
    autoform: {
      type: 'hidden'
    },
    autoValue: function() {
      let self = this;
      let title = self.field('title').value;

      if (this.isInsert && title) {
        return URLify2(title);
      } else if (this.isUpsert && title) {
        return {
          $setOnInsert: URLify2(title)
        };
      } else {
        this.unset();
      }
    }
  },
  content: {
    type: String,
    autoform: {
      type: 'summernote',
      class: 'editor',
      settings: {
        toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']]
        ]
      }
    }
  },
  createdAt: {
    type: Date,
    label: "Created at",
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      } else {
        this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    label: "Updated at",
    autoValue: function() {
      return new Date();
    }
  }
}));

Meteor.methods({
  updatePage: function(doc, docId) {
    check(doc, {
      $set: Object,
      $unset: Match.Optional(Object)
    });

    check(docId, String);

    check(doc.$set, {
      content: String,
      title: String,
      updatedAt: Match.Any
    });

    if (doc.$unset)
      check(doc.$unset, Object);


    let page = Pages.findOne({
      _id: docId
    });

    return Pages.update({
      _id: docId
    }, doc);
  }
});

//Allow/Deny - No client side ops allowed
Pages.allow({
  insert: function(userId, document) {
    return false;
  },
  update: function(userId, document, fields, modifier) {
    return false;
  },
  remove: function(userId, document) {
    return false;
  }
});

Pages.deny({
  insert: function(userId, document) {
    return true;
  },
  update: function(userId, document, fields, modifier) {
    return true;
  },
  remove: function(userId, document) {
    return true;
  }
});
