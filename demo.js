Messages = new Mongo.Collection('messages');

if (Meteor.isServer) {
  // This code only runs on the server.
  Meteor.publish("messages", function () {
    return Messages.find({}, {sort: {createdAt: -1}, limit: 20});
  });
}

if (Meteor.isClient) {
  // This code only runs on the client.
  var sub = Meteor.subscribe("messages");
}

Meteor.methods({
  sendMessage: function(message) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("non-authorized");
    }

    var user = Meteor.user();

    Messages.insert({
      text: message,
      createdAt: new Date(),
      // username: "anonymous"
      username: user ? user.username : 'anonymous',
      _user: user ? user : null
    });
  }
});


if (Meteor.isClient) {
  Template.body.helpers({
    recentMessages: function () {
      return Messages.find({}, {sort: {createdAt: 1}});
    }
  });

  Template.body.events({
    'keypress .textarea': function (e) {
      var text = e.target.innerText;

      if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();

        if (text.length > 0) {
          Meteor.call('sendMessage', text);

          // Clear the form and focus again.
          e.target.innerText = '';
          e.target.focus();
        }
      }
    }
  });

  Template.message.helpers({
    picture: function() {
      return this._user ? this._user.profile : '';
    },

    time: function() {
      if (this.createdAt) {
        return moment(this.createdAt).format('HH:mm a');
      }
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL",
  });

  Notification.requestPermission();
  Tracker.autorun(() => {
    Messages.find().observe({
      added: function(doc) {
        if (sub.ready() && !document.hasFocus()) {
          var notification = new Notification(doc.username, {
            body: doc.text,
            icon: doc._user ? doc._user.profile : null
          });
          setTimeout(() => { notification.close() }, 5000);
          notification.onclick = () => { window.focus() }
          window.onfocus = () => { notification.close() }
        }
      }
    });
  });
}
