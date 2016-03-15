
//var Collections = {};

//EntireData = Collections.EntireData = new Mongo.Collection("Meeting");
//EntireData.attachSchema(Schemas.Meeting);
//Meetings = Collections.Meetings = new Mongo.Collection("Meeting");
//Meetings.attachSchema(Schemas.Meeting);

//Projects = Collections.Projects = new Mongo.Collection("Project");
//Projects.attachSchema(Schemas.Project);

// FS collection uploaded usage
//var fs = Npm.require('fs');
//var path = Npm.require('path');
//var basepath = path.resolve('.').split('.meteor')[0];
//basepath = 'C:\\Users\\PZ7W60\\Repository\\MeetInfo\\';
//console.log(basepath);

//Schedules = new FS.Collection("schedule", {
//  stores: [new FS.Store.FileSystem("schedule", {path: basepath + "uploads/"})]
//});

/////////////////////////////////////////////////////////////////////////
// Client site
/////////////////////////////////////////////////////////////////////////
if (Meteor.isClient) {

  Template.registerHelper("Schemas", Schemas);
  Template.registerHelper("Collections", Collections);
  Template.registerHelper("TabularTables", { MeetingTable: TabularTables.MeetingTable} );

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

  ///////////////////////////////////////////////
  /// Uploader
  ///////////////////////////////////////////////
  Template.meetingUploader.events({
    'click .js-schedule-upload': function(event, template) {
      console.log("Click upload");
      $('#report_progress .progress-bar').css('width', 0 + '%');
      $('#schedule_upload').fileupload({
        dataType: 'json',
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(xlsx)$/i
        /*done: function (e, data) {
          var errors = data.result.Errors;
          if (errors && errors.length) {
              var items = $.map(errors, function (i, error) {
                  return $("<li>").text(error);
              });
              $("<ul>").append(items).appendTo('#upload_errors');
          } else {
            $.each(data.result.files, function (index, file) {
                //('<p/>').text(file.name).appendTo(document.body);
                console.log(file.name);
            });
          }
        }*/
      }).on('fileuploadprogressall', function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#schedule_progress .progress-bar').css(
            'width',
            progress + '%'
        );
      }).on('fileuploaddone', function (e, data) {
          $.each(data.result.files, function (index, file) {
            console.log(file.name);
              /*if (file.url) {
                  var link = $('<a>')
                      .attr('target', '_blank')
                      .prop('href', file.url);
                  $(data.context.children()[index])
                      .wrap(link);
              } else if (file.error) {
                  var error = $('<span class="text-danger"/>').text(file.error);
                  $(data.context.children()[index])
                      .append('<br>')
                      .append(error);
              }*/
          });
      }).on('fileuploadfail', function (e, data) {
          $.each(data.files, function (index) {
              var error = $('<span class="text-danger"/>').text('File upload failed.');
              $(data.context.children()[index])
                  .append('<br>')
                  .append(error);
          });
      });
      /*
      var files = event.target.files;
      console.log(files);
      for (var i = 0, ln = files.length; i < ln; i++) {
        Schedules.insert(files[i], function (err, fileObj) {
          // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        });
      }
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

    'click .js-report-upload': function(event, template) {
      console.log("Click report upload");
      $('#report_progress .progress-bar').css('width', 0 + '%');
      $('#report_upload').fileupload({
        dataType: 'json',
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(xlsx)$/i
      }).on('fileuploadprogressall', function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#report_progress .progress-bar').css(
            'width',
            progress + '%'
        );
      }).on('fileuploaddone', function (e, data) {
          $.each(data.result.files, function (index, file) {
            console.log(file.name);
          });
      }).on('fileuploadfail', function (e, data) {
          $.each(data.files, function (index) {
              var error = $('<span class="text-danger"/>').text('File upload failed. xlsx ONLY');
              error.appendTo('#upload_errors');
              $('#report_progress .progress-bar').css('width', 0 + '%');
              //var items = $("<li>").text(error);
              //$("<ul>").append(items).appendTo('#upload_errors');
              //$(data.context.children()[index])
              //    .append('<br>')
              //    .append(error);
          });
      });
      /*
      var files = event.target.files;
      console.log(files);
      for (var i = 0, ln = files.length; i < ln; i++) {
        Schedules.insert(files[i], function (err, fileObj) {
          // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        });
      }
      FS.Utility.eachFile(event, function(file) {
        console.log(file);
        Schedules.insert(file, function (err, fileObj) {
          //If !err, we have inserted new doc with ID fileObj._id, and
          //kicked off the data upload using HTTP
          console.log(fileObj._id);
        });
      });
      */
    }
  });

  ///////////////////////////////////////////////
  /// Table Templates
  ///////////////////////////////////////////////
  Template.passDescription.helpers({
    passColor: function() {
      var passStatus = this.meeting_pass;
      if (passStatus == "pass" ) {
        return "#5cb85c";
      } else if ( passStatus == "progress" ) {
        return "#f0ad4e";
      } else {
        return "#d9534f";
      }
    },

    passLabel: function() {
      var passStatus = this.meeting_pass;
      if (passStatus == "pass" ) {
        return "是";
      } else if ( passStatus == "progress" ) {
        return "跟进";
      } else {
        return "否x";
      }
    }
  });

  Template.selectMeeting.events({
    'click .js-select-meeting': function(event) {
      Session.set("selectedMeetingID", this._id);
      $("#meetingUpdate").modal('show');
    }
  });

  Template.deleteMeeting.events({
    'click .js-delete-meeting': function(event) {
      var meet_id = this._id;
      Meetings.remove({"_id" : meet_id});
      //$("tr#" + meet_id).hide('slow', function() {

      //});
    }
  });


  // send data to template
  Template.meetinfo.helpers({
    //searchKeyWord: Session.get('searchKeyWord'),

    meetings: function () {
      ids = Session.get('MeetingTargetIDs');
      if (ids && ids.length > 0) {
        return Meetings.find({"_id" : {"$in" : ids}}, {sort: {meeting_date : 1}});
      } /*else {
        //return [];
        var ids = [];
        docs = meetingBackEndIds.find();
        docs.forEach( function(element) {
          ids.push(element);
        });
        console.log(ids);
        return Meetings.find({"_id" : {"$in" : ids}});
      }*/
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
    'click .js-select-meeting': function(event) {
      //console.log(this._id);
      //console.log(Meetings.find({"_id": this._id}));
      Session.set("selectedMeetingID", this._id);
      $("#meetingUpdate").modal('show');
    },

    'click .js-delete-meeting': function(event) {
      var meet_id = this._id;
      $("tr#" + meet_id).hide('slow', function() {
        Meetings.remove({"_id" : meet_id});
      });
    }
  });

  /////////////////////////////////////////////
  // Template meetingOperation search / add button / export button
  /////////////////////////////////////////////
  Template.meetingOperation.helpers({

  });

  Template.meetingOperation.events({
    'click .js-search': function(event) {
      //keyWord = Session.get("searchKeyWord");
      keyWord = $("#search_text_box").val();
      console.log("Search Key Word: " + keyWord);
      var docs;
      if (!keyWord) {  // return all
        docs = Meetings.find(); // TODO: should be uploaded documents
      } else {
        docs = Meetings.find({"projectID": keyWord});
        if (docs.count() <= 0) {
          docs = Meetings.find({"meeting_title": {$regex: keyWord, $options: 'i'} });
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
      //Session.set("searchKeyWord", event.target.value);
      $("#search_button").click();
    },

    'click #download' : function(event) {
      var csvLabel = [];
      var fullSchema = Schemas.Meeting.schema();
      var exportSchema = Meteor.myConstants.selectedFields;
      for (var colIndex = 0 ; colIndex < exportSchema.length; colIndex++ ) {
        csvLabel.push(fullSchema[exportSchema[colIndex]]["label"]);
      }

      if (Meetings.find().count() > 0) {
        Meteor.myFunctions.JSONToCSVConvertor("meetings_export",
          Meetings.find().fetch(), Meteor.myConstants.selectedFields, csvLabel);
      }
      //csv = json2csv(Meetings.find().fetch(), true, true);
      //event.target.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
      //event.target.download = "meetings_export.csv";
    },

    'click .js-show-meeting-form' : function(event) {
      console.log("ADD form show");
      $("#meeting_add_form").modal('show');
    }
  });

  /////////////////////////////////////////////
  // Template add meeting
  /////////////////////////////////////////////
  Template.meeting_add_form.helpers({
    selectedFields: function() {
      return Meteor.myConstants.selectedFields;
    }
  });

  Template.meeting_add_form.events({
    'click .js-add-meeting': function () {
      //TODO: Check meeting duplicate
      //TODO: refresh session
      console.log("bbb");
      $('#meeting_add_form').modal('hide');
    }
  });

  /////////////////////////////////////////////
  // Template meeting list
  /////////////////////////////////////////////
  Template.meetingUpdate.helpers({

    selectedFields: function() {
      return Meteor.myConstants.selectedFields;
    },
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
    'click .js-update-confirm': function() {
      $('#meetingUpdate').modal('hide');
    },

    'click .js-update-reset': function () {
      Session.set("selectedMeetingID", 0);
    }
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


  Schedules.allow({
    'insert': function () {
      // add custom authentication code here
      return true;
    }
  });

  Schedules.remove({});
  */
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
