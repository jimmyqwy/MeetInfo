if (Meteor.isClient) {

  Schemas = {};

  Template.registerHelper("Schemas", Schemas);

  Schemas.Meeting = new SimpleSchema({
    ID: {
      type: String,
      autoform: {
        omit: true
      }
    },
    projectID: {
      type: String,
      optional: true
    },
    type: {
      type: String,
      optional: true
    },
    group: {
      type: String,
      optional: true
    },
    system: {
      type: String,
      optional: true
    },
    orgnizer: {
      type: String,
      optional: true
    },
    title: {
      type: String,
    },
    date : {
      type: String,
      optional: true,
      autoform: {
        afFieldInput: {
          type: "date"
        }
      }
    },
    result: {
      type: String,
      optional: true
    },
    pass: {
      type: String,
      optional: true,
      autoform: {
        afFieldInput: {
          type: "boolean-checkbox"
        }
      }
    },
    comment: {
      type: String,
      optional: true
    }
  });

  var Collections = {};

  Template.registerHelper("Collections", Collections);

  Meetings = Collections.Meetings = new Mongo.Collection("Meeting");
  Meetings.attachSchema(Schemas.Meeting);
  Meetings.insert({
    ID: "1",
    projectID: "JTDK011300013",
    type: "Decision",
    group: "Insurance",
    system: "Investigate",
    orgnizer: "YE FEI",
    title: "Many Details",
    date: "2016/1/1",
    result: "blank",
    pass: "YES",
    comment: "comments"
  },
  );
  console.log(Meetings);

  /*
  Meteor.publish(null, function () {
    return Meetings.find();
  });*/

  Meetings.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return true;
    }
  });

  Template.meetingUpdate.helpers({

    selectedMeetingDoc: function () {
      //return Meetings.findOne(Session.get("selectedPersonId"));
      return Meetings.findOne(1);
    },
    isSelectedPerson: function () {
      return Session.equals("selectedPersonId", this._id);
    },
    formType: function () {
      /*
      if (Session.get("selectedPersonId")) {
        return "update";
      } else {
        return "disabled";
      }
      */
      return "update";
    },
    disableButtons: function () {
      return !Session.get("selectedPersonId");
    }
  });

  Template.meetingUpdate.events({
    'click .person-row': function () {
      Session.set("selectedPersonId", this._id);
    },
  });

  /////////////////////////////////////////////////////////////////////////
  var meeting_data = [
    {
      meet_ID: "1",
      meet_project_ID: "JTDK011300013",
      meet_type: "Decision",
      meet_group: "Insurance",
      meet_system: "Investigate",
      meet_orgnizer: "YE FEI",
      meet_title: "Many Details",
      meet_date: "2016/1/1",
      meet_result: "blank",
      meet_pass: "YES",
      meet_comment: "comments"
    },
    {
      meet_ID: "2",
      meet_project_ID: "JTDK011500048",
      meet_type: "Decision2",
      meet_group: "Medical",
      meet_system: "Investigate2",
      meet_orgnizer: "YE FEI",
      meet_title: "Many Details2",
      meet_date: "2016/1/2",
      meet_result: "blank",
      meet_pass: "YES",
      meet_comment: "comments"
    },
    {
      meet_ID: "JTDK011400037",
      meet_project_ID: "JTDK011500048",
      meet_type: "Decision3",
      meet_group: "IT",
      meet_system: "Investigate3",
      meet_orgnizer: "YE FEI",
      meet_title: "Many Details3",
      meet_date: "2016/1/3",
      meet_result: "blank",
      meet_pass: "YES",
      meet_comment: "comments"
    },
  ];

  // counter starts at 0
  Session.setDefault('counter', 0);

  // send data to template
  Template.meetinfo.helpers({
    counter: function () {
      return Session.get('counter');
    },
    meetings: meeting_data
  });

  // events
  Template.meetinfo.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
