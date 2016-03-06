
var Collections = {};

//EntireData = Collections.EntireData = new Mongo.Collection("Meeting");
//EntireData.attachSchema(Schemas.Meeting);
Meetings = Collections.Meetings = new Mongo.Collection("Meeting");
Meetings.attachSchema(Schemas.Meeting);

Projects = Collections.Projects = new Mongo.Collection("Project");
Projects.attachSchema(Schemas.Project);

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

  /////////////
  // Uploader
  Uploader.localisation = {
    browse: "Upload Outlook Schedule"
  };

  //meetingBackEndIds = new Mongo.Collection('meetingIDs');
  //Meteor.subscribe("meetingsBackEnd");

  /////////////////////////////////////////////
  // Template "meetinginfo" (List of meeting information)
  /////////////////////////////////////////////

  Session.setDefault("searchKeyWord", "");


  // send data to template
  Template.meetinfo.helpers({
    searchKeyWord: Session.get('searchKeyWord'),

    meetings: function () {
      ids = Session.get('MeetingTargetIDs');
      if (ids && ids.length > 0) {
        return Meetings.find({"_id" : {"$in" : ids}});
      } else {
        //return [];
        var ids = [];
        docs = meetingBackEndIds.find();
        docs.forEach( function(element) {
          ids.push(element);
        });
        console.log(ids);
        return Meetings.find({"_id" : {"$in" : ids}});
      }
    },

    passColor: function(passStatus) {
      if (passStatus == "pass" ) {
        return "#5cb85c";
      } else if ( passStatus == "progress" ) {
        return "#f0ad4e";
      } else {
        return "#d9534f";
      }
    },

    passLabel: function(passStatus) {
      if (passStatus == "pass" ) {
        return "是";
      } else if ( passStatus == "progress" ) {
        return "跟进";
      } else {
        return "否x";
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

    'change .js-search-text': function(event) {
      //console.log(event.target);
      Session.set("searchKeyWord", event.target.value);
    },

    'click .js-select-meeting': function(event) {
      //console.log(this._id);
      //console.log(Meetings.find({"_id": this._id}));
      Session.set("selectedMeetingID", this._id);
    },

    'click .js-delete-meeting': function(event) {
      var meet_id = this._id;
      $("tr#" + meet_id).hide('slow', function() {
        Meetings.remove({"_id" : meet_id});
      });

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
  /*
  Meteor.publish('meetingsBackEnd', function() {
    var self = this;
    console.log("MeetingPublish: "+ Meetings.find().count());
    Meetings.find().forEach(function(meeting) {
      self.added('meetingIDs', Random.id(), meeting._id);
    })
    self.ready();
  });
  */
}
