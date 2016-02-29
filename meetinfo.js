Schemas = {};

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
  organizer: {
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

//EntireData = Collections.EntireData = new Mongo.Collection("Meeting");
//EntireData.attachSchema(Schemas.Meeting);
Meetings = Collections.Meetings = new Mongo.Collection("Meeting");
Meetings.attachSchema(Schemas.Meeting);

/////////////////////////////////////////////////////////////////////////
// Client site
/////////////////////////////////////////////////////////////////////////
if (Meteor.isClient) {

  Template.registerHelper("Schemas", Schemas);
  Template.registerHelper("Collections", Collections);

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

  /////////////////////////////////////////////
  // Template "meetinginfo" (List of meeting information)
  /////////////////////////////////////////////

  Session.setDefault("searchKeyWord", "");

  // send data to template
  Template.meetinfo.helpers({
    searchKeyWord: Session.get('searchKeyWord'),

    meetings: function () {
      ids = Session.get('MeetingTargetIDs');
      console.log(ids);
      if (ids) {
        return Meetings.find({"_id" : {"$in" : ids}});
      } else {
        return [];
      }
    }
  });

  // events
  Template.meetinfo.events({

    'click .js-search': function(event) {
      keyWord = Session.get("searchKeyWord");
      console.log("Search Key Word: " + keyWord);
      var docs;
      if (!keyWord) {  // return all
        docs = Meetings.find(); // TODO: should be uploaded documents
      } else {
        docs = Meetings.find({"projectID": keyWord});
        if (docs.count() <= 0) {
          docs = Meetings.find({"title": {$regex: keyWord, $options: 'i'} });
        }
      }

      ids = [];
      docs.forEach( function(element){
        ids.push(element._id);;
      });
      Session.set('MeetingTargetIDs', ids);
    },

    'click .js-select-meeting': function(event) {
      //console.log(this._id);
      //console.log(Meetings.find({"_id": this._id}));
      Session.set("selectedMeetingID", this._id);
    },

    'change .js-search-text': function(event) {
      console.log(event.target);
      Session.set("searchKeyWord", event.target.value);
    }
  });

  /////////////////////////////////////////////
  // Template meeting list
  /////////////////////////////////////////////
  Template.meetingUpdate.helpers({

    selectedMeetingDoc: function () {
      return Meetings.findOne(Session.get("selectedMeetingID"));
    },
    isSelectedPerson: function () {
      return Session.equals("selectedMeetingID", this._id);
    },
    formType: function () {
      if (Session.get("selectedMeetingID")) {
        return "update";
      } else {
        return "disabled";
      }
    },
    disableButtons: function () {
      return !Session.get("selectedMeetingID");
    }
  });

  Template.meetingUpdate.events({
    'click .js-update-reset': function () {
      Session.set("selectedMeetingID", 0);
    },
  });

  /////////////////////////////////////////////////////////////////////////

}


if (Meteor.isServer) {
/*  // at startup.js
  Meteor.startup(function () {
    // code to run on server at startup
  });
  */
  
}
