var UploaderProcessor = function (uploaderName, uploaderID, progressID) {
  console.log("Click " + uploaderName);
  // clean progress bar
  $('#' + progressID + ' .progress-bar').css('width', 0 + '%');
  // clean error information
  $('#upload_errors .text-danger').remove();

  // start to upload
  console.log('#' + uploaderID);
  $('#' + uploaderID).fileupload({
    dataType: 'json',
    autoUpload: true,
    formData: {uploadType: uploaderID},
    acceptFileTypes: /(\.|\/)(xlsx)$/i,
    always: function(e, data) {
      console.log("always")
      console.log(data);
    }
  }).on('fileuploadprogressall', function (e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);
    $('#' + progressID + ' .progress-bar').css('width',progress + '%');
  }).on('fileuploaddone', function (e, data) {
    if (data.result) {
      $.each(data.result.files, function (index, file) {
        console.log(file.name);
      });
    } else {
      var error = $('<span class="text-danger"/>').text('[' + uploaderName + '] File upload failed. xlsx ONLY');
      $('#upload_errors .text-danger').remove();
      error.append('<br>').appendTo('#upload_errors');
      $('#' + progressID + ' .progress-bar').css('width', 0 + '%');
    }
  }).on('fileuploadfail', function (e, data) {
    console.log(data);
    $.each(data.files, function (index) {
      var errorMessage = '[' + uploaderName + '] File upload failed. ';
      var responseText = data.jqXHR ? data.jqXHR.responseText : "";
      errorMessage = errorMessage + responseText;
      var error = $('<span class="text-danger"/>').text(errorMessage);
      $('#upload_errors .text-danger').remove();
      error.append('<br>').appendTo('#upload_errors');
      $('#' + progressID + ' .progress-bar').css('width', 0 + '%');
      //var items = $("<li>").text(error);
      //$("<ul>").append(items).appendTo('#upload_errors');
      //$(data.context.children()[index])
      //    .append('<br>')
      //    .append(error);
    });
  });
}

  // Routing
  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });

  Router.route('/', function() {
    this.render('navbar', { to : "navigator"} );
    this.render('meetinfo', { to : "main"});
  });

  Router.route('/uploader', function() {
    this.render('navmenu', { to : "navigator"} );
    this.render('meetingUploader', { to : "main"});
  });

  Router.route('/dashboard', function() {
    this.render('navmenu', { to : "navigator"} );
    this.render('meetingDashboard', { to : "main"});
  });

  // Register
  Template.registerHelper("Schemas", Schemas);
  Template.registerHelper("Collections", Collections);
  Template.registerHelper("TabularTables", {
    MeetingTable: TabularTables.MeetingTable,
    GroupDashBoardTable: TabularTables.GroupDashBoardTable
  } );

  /*
  Meteor.publish(null, function () {
    return Meetings.find();
  });*/



  /////////////////////////////////////////////
  // Template "meetinginfo" (List of meeting information)
  /////////////////////////////////////////////

  Session.setDefault("SearchKeyWord", "");

  // Match project Info when input ProjectID in inserting form
  Session.setDefault("MatchedProjectID", "");

  // Dash board result and project type selected in group dash board
  Session.setDefault("DashBoardResult", {});
  Session.setDefault('GroupDashBoard_ProjectSelect', "");

  ///////////////////////////////////////////////
  /// Uploader
  ///////////////////////////////////////////////
  Template.meetingUploader.events({
    'click .js-schedule-upload': function(event, template) {
      UploaderProcessor("Outlook Schedule Uploader", "schedule_upload", "schedule_progress");
    },
    'click .js-invest-upload': function(event, template) {
      UploaderProcessor("Outlook Investment Project Uploader", "invest_upload", "invest_progress");
    },
    'click .js-report-upload': function(event, template) {
      UploaderProcessor("Report Uploader", "report_upload", "report_progress");
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
      $('#update_meeting_input_errors .text-danger').remove();
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
    //SearchKeyWord: Session.get('SearchKeyWord'),

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
        return "��";
      } else if ( passStatus == "progress" ) {
        return "����";
      } else {
        return "��x";
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
      //keyWord = Session.get("SearchKeyWord");
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
      //Session.set("SearchKeyWord", event.target.value);
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
      $('#add_meeting_input_errors .text-danger').remove();
      $("#meeting_add_form").modal('show');
    }
  });

  /////////////////////////////////////////////
  // Template add meeting
  /////////////////////////////////////////////
  Template.meeting_add_form.helpers({
    selectedFields: function() {
      return Meteor.myConstants.selectedFields;
    },
    matchedMeetingDoc: function () {
      var projectID = Session.get("MatchedProjectID");
      console.log("Matching " + projectID);
      if (projectID) {
        var projectCursor = Projects.findOne({"projectID" : projectID});
        if (projectCursor) {
          var meetingInstance = {};
          for(var k in Schemas.Meeting.schema()) {
            meetingInstance[k] = "";
          }
          meetingInstance.projectID = projectID;
          //console.log(projectCursor);
          for(var k in Schemas.Project.schema()) {

            meetingInstance[k] = projectCursor[k];
          }
          //console.log(meetingInstance);
          return meetingInstance;
        }
      }
    }
  });

  // Insert Hooks
  AutoForm.addHooks('addMeetingInfo', {
    after: {
      insert: function(error, result) {
        $('#add_meeting_input_errors .text-danger').remove();
        if (error) {
          console.log("Insert Error:", error);
          var errorDOM = $('<span class="text-danger"/>').text("Error: " + error.message);
          errorDOM.append('<br>').appendTo('#add_meeting_input_errors');
        } else {  // sucessful
          console.log("Document inserted:", result);
          $('#meeting_add_form').modal('hide');
          $('#meeting_table').dataTable().api().ajax.reload(null, false);
        }
      }
    }
  });

  Template.meeting_add_form.events({
    /*
    'click .js-add-meeting': function () {
      //TODO: Check meeting duplicate
      //TODO: refresh session

    },
    */

    'click .js-match-meeting': function () {
      var projectID = AutoForm.getFieldValue("projectID","addMeetingInfo");
      Session.set("MatchedProjectID", projectID);
    },

    'change input[name=proposed_amount]': function (event, template) {
      var proposed_amount = $(event.target).val();
      /*
      var currency = $('select[name=currency]').val();
      var ratio = 1;
      for (var i = 0; i < Meteor.myConstants.currency.length; i++) {
        if (Meteor.myConstants.currency[i].value == currency) {
          ratio = Meteor.myConstants.currency[i].ratio;
          break;
        }
      }
      */
      var ratio = $('select[name=currency] option:selected').attr('ratio');
      if (!ratio) {
        ratio = 1;
      }
      template.$('input[name=proposed_amount_CNY]').val(proposed_amount * ratio);
    },

    'change input[name=pass_invest]': function (event, template) {
      var proposed_amount = $(event.target).val();
      var ratio = $('select[name=currency] option:selected').attr('ratio');
      if (!ratio) {
        ratio = 1;
      }
      template.$('input[name=pass_invest_CNY]').val(proposed_amount * ratio);
    },

    'change input[name=real_pay]': function (event, template) {
      var proposed_amount = $(event.target).val();
      var ratio = $('select[name=currency] option:selected').attr('ratio');
      if (!ratio) {
        ratio = 1;
      }
      template.$('input[name=real_pay_CNY]').val(proposed_amount * ratio);
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

  // Insert Hooks
  AutoForm.addHooks('meetingInfo', {
    after: {
      update: function(error, result) {
        $('#update_meeting_input_errors .text-danger').remove();
        if (error) {
          console.log("Update Error:", error);
          var errorDOM = $('<span class="text-danger"/>').text("Error: " + error.message);
          errorDOM.append('<br>').appendTo('#update_meeting_input_errors');
        } else {  // sucessful
          console.log("Document updated:", result);
          $('#meetingUpdate').modal('hide');
          $('#meeting_table').dataTable().api().ajax.reload(null, false);
        }
      }
    }
  });

  Template.meetingUpdate.events({
    /*'click .js-update-confirm': function() {
      $('#meetingUpdate').modal('hide');
    },*/

    'click .js-update-reset': function () {
      Session.set("selectedMeetingID", 0);
    },

    'change input[name=proposed_amount]': function (event, template) {
      var proposed_amount = $(event.target).val();
      var ratio = $('#meetingInfo select[name=currency] option:selected').attr('ratio');
      if (!ratio) {
        ratio = 1;
      }
      template.$('input[name=proposed_amount_CNY]').val(proposed_amount * ratio);
    },

    'change input[name=pass_invest]': function (event, template) {
      var proposed_amount = $(event.target).val();
      var ratio = $('#meetingInfo select[name=currency] option:selected').attr('ratio');
      if (!ratio) {
        ratio = 1;
      }
      template.$('input[name=pass_invest_CNY]').val(proposed_amount * ratio);
    },

    'change input[name=real_pay]': function (event, template) {
      var proposed_amount = $(event.target).val();
      var ratio = $('#meetingInfo select[name=currency] option:selected').attr('ratio');
      if (!ratio) {
        ratio = 1;
      }
      template.$('input[name=real_pay_CNY]').val(proposed_amount * ratio);
    }
  });

  /////////////////////////////////////////////
  // Template Dashboard
  /////////////////////////////////////////////
  var renderTimeout = false;
  Template.meetingDashboard.onRendered(function() {
    this.$('.input-daterange').datepicker({
        format: "yyyy-mm-dd",
        language: "zh-CN"
    });

/*
    this.$('#js-project-dropdown').selectpicker({
        style: 'btn-primary',
        size: false
    });

    if (renderTimeout !== false) {
      Meteor.clearTimeout(renderTimeout);
    }
    renderTimeout = Meteor.setTimeout(function() {
      $('#js-project-dropdown').selectpicker("refresh");
      renderTimeout = false;
    }, 10);
*/

  });
  Template.meetingDashboard.events({
    'click .js-dash-cal': function() {
      //console.log($('#dashboard_datepicker .range_start'));
      var startDate = $('#dashboard_datepicker .range_start').val();
      var endDate = $('#dashboard_datepicker .range_end').val();
      //GroupDashBoard.remove({});

      Meteor.call("meetingReport", startDate, endDate, function (error, result) {
        console.log(error);
        console.log(result);
        $('#dashboard_result .text-danger').remove();
        $('#dashboard_result .text-result').remove();
        if (error) {
          var error = $('<span class="text-danger"/>').text(error);
          error.append('<br>').appendTo('#dashboard_result');
        }
        if (result) {
          console.log("DashBoard From Server: ");
          console.log(result);
          Session.set("DashBoardResult", result);
        }
      });
    },

    'change #js-project-dropdown': function(event) {
      //var currentTarget = evt.currentTarget;
      //console.log(currentTarget.options[currentTarget.selectedIndex]);
      //var statusValue = currentTarget.options[currentTarget.selectedIndex].value;
      var statusValue = $(event.currentTarget).val();
      console.log(statusValue);
      Session.set('GroupDashBoard_ProjectSelect', statusValue);
    }
  });

  Template.meetingDashboard.helpers({
    dashboard: function () {
      dashBoard = Session.get('DashBoardResult');

      dashBoard.proposed_amount_total = numeral(dashBoard.proposed_amount_total).format('0,0.00');
      dashBoard.pass_amount_total = numeral(dashBoard.pass_amount_total).format('0,0.00');
      dashBoard.invest_amount_total = numeral(dashBoard.invest_amount_total).format('0,0.00');

      dashBoard.proposed_amount_total_neg = numeral(dashBoard.proposed_amount_total_neg).format('0,0.00');
      dashBoard.pass_amount_total_neg = numeral(dashBoard.pass_amount_total_neg).format('0,0.00');
      dashBoard.invest_amount_total_neg = numeral(dashBoard.invest_amount_total_neg).format('0,0.00');

      dashBoard.pass_target_ratio = numeral(dashBoard.pass_target_ratio).format('0,0.00');
      dashBoard.invest_target_ratio = numeral(dashBoard.invest_target_ratio).format('0,0.00');
      dashBoard.pass_meeting_ratio = numeral(dashBoard.pass_meeting_ratio).format('0,0.00');
      return dashBoard;
    },
    project_types: function() {
      //return Meteor.myConstants.project_type;
      var project_types_dash = [{label: "�ܼ�", value: "ALL"}];
      for (var i = 0; i < Meteor.myConstants.project_type.length; i++ ) {
        project_types_dash.push(Meteor.myConstants.project_type[i]);
      }
      return project_types_dash;
    },
    group_dashboard_selector: function() {
      var selector = {};
      var selectedType = Session.get('GroupDashBoard_ProjectSelect');
      console.log(selectedType);
      if (selectedType) {
        selector = {project_type: selectedType};
      }
      return selector;
    }
  });
