
var Collections = {};

//EntireData = Collections.EntireData = new Mongo.Collection("Meeting");
//EntireData.attachSchema(Schemas.Meeting);
Meetings = Collections.Meetings = new Mongo.Collection("Meeting");
Meetings.attachSchema(Schemas.Meeting);

Projects = Collections.Projects = new Mongo.Collection("Project");
Projects.attachSchema(Schemas.Project);

// FS collection uploaded usage
//var fs = Npm.require('fs');
//var path = Npm.require('path');
//var basepath = path.resolve('.').split('.meteor')[0];
basepath = 'C:\\Users\\PZ7W60\\Repository\\MeetInfo\\';
console.log(basepath);

Schedules = new FS.Collection("schedule", {
  stores: [new FS.Store.FileSystem("schedule", {path: basepath + "uploads/"})]
});

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

    // upload
    'change .js-schedule-upload': function(event, template) {
      var files = event.target.files;
      console.log(files);
      for (var i = 0, ln = files.length; i < ln; i++) {
        Schedules.insert(files[i], function (err, fileObj) {
          // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        });
      }
      /*
      FS.Utility.eachFile(event, function(file) {
        console.log(file);
        Schedules.insert(file, function (err, fileObj) {
          //If !err, we have inserted new doc with ID fileObj._id, and
          //kicked off the data upload using HTTP
          console.log(fileObj._id);
        });
      });
      */
    },

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

    },

    'click #download' : function(event) {
      var csvLabel = [];
      var exportSchema = Schemas.Meeting.schema();
      for(var k in exportSchema) {
        csvLabel.push(exportSchema[k]["label"]);
      }
      if (Meetings.find().count() > 0) {
        Meteor.myFunctions.JSONToCSVConvertor("meetings_export",
          Meetings.find().fetch(), csvLabel);
      }
      //csv = json2csv(Meetings.find().fetch(), true, true);
      //event.target.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
      //event.target.download = "meetings_export.csv";
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
  // FS collection uploaded usage
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var basepath = path.resolve('.').split('.meteor')[0];
  console.log(basepath);

  Schedules = new FS.Collection("schedule", {
    stores: [new FS.Store.FileSystem("schedule", {path: basepath + "uploads/"})]
  });
  */

  Schedules.allow({
    'insert': function () {
      // add custom authentication code here
      return true;
    }
  });

  Schedules.remove({});
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
