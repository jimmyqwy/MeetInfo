
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

//TEMP
//Dashboard = new Mongo.Collection("Dashboard");

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
/////////////////////////////////////////////////////////////////////////
// Client site
/////////////////////////////////////////////////////////////////////////
if (Meteor.isClient) {

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

  Meetings.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return true;
    }
  });

  Projects.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return true;
    }
  });

  GroupDashBoard.allow({
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
      return dashBoard;
    },
    project_types: function() {
      return Meteor.myConstants.project_type;
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
}

if (Meteor.isServer) {

  DashBoard = Collections.DashBoard = new Mongo.Collection("DashBoard");
  DashBoard.remove({});
  console.log("Dashboard refresh...");
  DashBoard.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return true;
    }
  });

  Meteor.methods({

    meetingReport: function(startDate, endDate) {
      console.log(startDate);
      console.log(endDate);
      //console.log(Meetings.find({projectID:'JTXH011500002'}).fetch());

      var reportMap = function() {  // map

        var key = this.projectID;

        // TODO CNY!!!
        // !!! TODO proposed_amount / pass_invest / real_pay use CNY !!!!!
        var singleValue = {
          meeting_date: new Date(this.meeting_date),
          project_type: this.project_type,

          proposed_flag: 0,
          proposed_flag_neg: 0,
          proposed_amount: 0,
          proposed_amount_neg: 0,

          pass_flag:  0,
          pass_flag_neg: 0,
          pass_invest: 0,
          pass_invest_neg: 0,

          invest_flag:  0,
          invest_flag_neg: 0,
          real_pay: 0,
          real_pay_neg: 0,

          groups: []
        };

        // PROPOSED
        if (this.proposed_amount && this.proposed_amount > 0 ) {
          singleValue.proposed_flag = 1;
          singleValue.proposed_amount = this.proposed_amount;
        } else if (this.proposed_amount && this.proposed_amount < 0) {
          singleValue.proposed_flag_neg = 1;
          singleValue.proposed_amount_neg = this.proposed_amount;
        }

        // PASS
        if (this.pass_invest && this.pass_invest >= 0 &&
            this.meeting_pass == "pass") {
          singleValue.pass_flag = 1;
          singleValue.pass_invest = this.pass_invest;
        } else if (this.meeting_pass == "fail") {
          singleValue.pass_flag = 0;
          singleValue.pass_flag_neg = 0;
          singleValue.pass_invest = 0;
          singleValue.pass_invest_neg = 0;
        } else if (this.pass_invest && this.pass_invest < 0 &&
          this.meeting_pass == "pass") {
          singleValue.pass_flag_neg = 1;
          singleValue.pass_invest_neg = this.pass_invest;
        }

        // REAL INVEST
        if ((this.real_pay && this.real_pay > 0) || this.invest_or_not == "yes") {
          // if real_pay exist, accumulate proposed and pass amount
          singleValue.invest_flag = 1;
          singleValue.real_pay = this.real_pay;
        } else if (this.real_pay && this.real_pay < 0) {
          // if real_pay exist, accumulate proposed and pass amount
          singleValue.invest_flag_neg = 1;
          singleValue.real_pay_neg = this.real_pay;
        }

        // groups
        groups = [];
        groups.push(this.group);
        if (this.union_group) {
          var union = this.union_group.split("&").map(function(a){ return a.trim()});
          for (var i = 0 ; i < union.length; i++) {
            groups.push(union[i]);
          }
        }
        for (var idx = 0; idx < groups.length; idx++) {
          var groupShare = {};
          groupShare.group = groups[idx];
          //groupShare.group = groupKey;
          groupShare.proposed_share = singleValue.proposed_amount / groups.length;
          groupShare.pass_share = singleValue.pass_invest / groups.length;
          groupShare.invest_share = singleValue.real_pay / groups.length;

          groupShare.proposed_share_neg = singleValue.proposed_amount_neg / groups.length;
          groupShare.pass_share_neg = singleValue.pass_invest_neg / groups.length;
          groupShare.invest_share_neg = singleValue.real_pay_neg / groups.length;
          singleValue.groups.push(groupShare);
        }

        // emit
        emit(key, singleValue);
      };

      var reportReduce = function(key, values) {  // reduce
        // sort by meeting_date
        values.sort( function(meetObjA, meetObjB) {
          var a = meetObjA.meeting_date;
          var b = meetObjB.meeting_date;
          return (a>b)-(a<b) ;
        });

        var meeting_date_reduced = 0;
        if (values) {
          meeting_date_reduced = new Date(values[values.length - 1].meeting_date);
        }

        var reducedVal = {
          meeting_date: meeting_date_reduced,
          project_type: values[values.length - 1].project_type,

          proposed_flag: 0,
          proposed_flag_neg: 0,
          proposed_amount: 0,
          proposed_amount_neg: 0,

          pass_flag:  0,
          pass_flag_neg: 0,
          pass_invest: 0,
          pass_invest_neg: 0,

          invest_flag:  0,
          invest_flag_neg: 0,
          real_pay: 0,
          real_pay_neg: 0,

          groups: []
        };
        // Groups: { group: "", proposed_share: "",  pass_share: "",   invest_share: "" }
        var groupMaps = {};

        for (var idx = 0; idx < values.length; idx++) {

          var proposed_amount = values[idx].proposed_amount;
          var proposed_amount_neg = values[idx].proposed_amount_neg;

          var pass_flag = values[idx].pass_flag;
          var pass_invest = values[idx].pass_invest;
          var pass_invest_neg = values[idx].pass_invest_neg;

          var invest_flag = values[idx].invest_flag;
          var real_pay = values[idx].real_pay;
          var real_pay_neg = values[idx].real_pay_neg;

          // PROPOSED
          if (proposed_amount && proposed_amount > 0 ) {
            reducedVal.proposed_flag = 1;
            reducedVal.proposed_amount = proposed_amount;
          } else if (proposed_amount && proposed_amount < 0) {
            reducedVal.proposed_flag_neg = 1;
            reducedVal.proposed_amount_neg = proposed_amount;
          }

          // PASS
          if (pass_invest && pass_invest >= 0 && pass_flag == 1) {
            reducedVal.pass_flag = 1;
            reducedVal.pass_invest = pass_invest;
          } else if (pass_flag == 0) {
            reducedVal.pass_flag = 0;
            reducedVal.pass_flag_neg = 0;
            reducedVal.pass_invest = 0;
            reducedVal.pass_invest_neg = 0;
          } else if (pass_invest && pass_invest < 0 && pass_flag == 1) {
            reducedVal.pass_flag_neg = 1;
            reducedVal.pass_invest_neg = pass_invest;
          }

          // REAL INVEST
          if ((real_pay && real_pay > 0) || invest_flag == 1) {
            // if real_pay exist, accumulate proposed and pass amount
            singleValue.invest_flag = 1;
            reducedVal.proposed_amount += proposed_amount;
            reducedVal.pass_invest += pass_invest;
            reducedVal.real_pay += real_pay;
          } else if (real_pay && real_pay < 0) {
            // if real_pay exist, accumulate proposed and pass amount
            singleValue.invest_flag_neg = 1;
            reducedVal.proposed_amount_neg += proposed_amount_neg;
            reducedVal.pass_invest_neg += pass_invest_neg;
            reducedVal.real_pay_neg += real_pay;
          }

          // last row, and real_pay is null
          if (idx == values.length - 1 && !real_pay) {
            reducedVal.proposed_amount += proposed_amount;
            reducedVal.pass_invest += pass_invest;
            reducedVal.proposed_amount_neg += proposed_amount_neg;
            reducedVal.pass_invest_neg += pass_invest_neg;
          }

          for (var i = 0 ; i < values[idx].groups.length; i++) {
            groupMaps[values[idx].groups[i]] = 1;
          }
        }

        // GroupMaps are MAP that = {key: value} key with groupName and value is one.
        //for (var groupIdx; groupIdx < groups.length; groupIdx++) {
        var groupKeys = Object.keys(groupMaps);
        for (var groupIdx = 0; groupIdx < groupKeys.length; groupIdx++) {

          var groupShare = {};
          groupShare.group = groupKeys[groupIdx];
          //groupShare.group = groupKey;
          groupShare.proposed_share = reducedVal.proposed_amount / groupKeys.length;
          groupShare.pass_share = reducedVal.pass_invest / groupKeys.length;
          groupShare.invest_share = reducedVal.real_pay / groupKeys.length;

          groupShare.proposed_share_neg = reducedVal.proposed_amount_neg / groupKeys.length;
          groupShare.pass_share_neg = reducedVal.pass_invest_neg / groupKeys.length;
          groupShare.invest_share_neg = reducedVal.real_pay_neg / groupKeys.length;
          reducedVal.groups.push(groupShare);
        }
        return reducedVal;
      };

      var result = Meetings.mapReduce(
        reportMap,
        reportReduce,
        {
          out: "DashBoard",
          query:  {
            meeting_date: {'$gte':startDate, '$lte': endDate} ,
            meeting_type : {'$in': ["投资决策", "投后管理"]}
          },
          verbose: true
        }
      );

      var reducedResults = DashBoard.find().fetch();
      //console.log(reducedResults);
      result = {};
      result.proposed_count = 0;
      result.proposed_amount_total = 0;
      result.pass_count = 0;
      result.pass_amount_total = 0;
      result.invest_count = 0;
      result.invest_amount_total = 0;

      result.proposed_count_neg = 0;
      result.proposed_amount_total_neg = 0;
      result.pass_count_neg = 0;
      result.pass_amount_total_neg = 0;
      result.invest_count_neg = 0;
      result.invest_amount_total_neg = 0;

      groupResult = {};
      //console.log(reducedResults.length);
      for (var i = 0; i < reducedResults.length; i++) {
        result.proposed_count += reducedResults[i].value.proposed_flag;
        result.pass_count += reducedResults[i].value.pass_flag;
        result.invest_count += reducedResults[i].value.invest_flag;

        result.proposed_count_neg += reducedResults[i].value.proposed_flag_neg;
        result.pass_count_neg += reducedResults[i].value.pass_flag_neg;
        result.invest_count_neg += reducedResults[i].value.invest_flag_neg;

        result.proposed_amount_total += reducedResults[i].value.proposed_amount;
        result.pass_amount_total += reducedResults[i].value.pass_invest;
        result.invest_amount_total += reducedResults[i].value.real_pay;

        result.proposed_amount_total_neg += reducedResults[i].value.proposed_amount_neg;
        result.pass_amount_total_neg += reducedResults[i].value.pass_invest_neg;
        result.invest_amount_total_neg += reducedResults[i].value.real_pay_neg;

        for (var groupIdx = 0; groupIdx < reducedResults[i].value.groups.length; groupIdx++) {
          var groupReducedResult = reducedResults[i].value.groups[groupIdx];
          //console.log(groupReducedResult);
          var groupName = groupReducedResult.group;
          if ( groupName ) {
            var groupCombineKey = groupName + "+" +
                                  reducedResults[i].value.project_type;
            var groupInstance = {
              proposed_share : groupReducedResult.proposed_share,
              pass_share : groupReducedResult.pass_share,
              invest_share : groupReducedResult.invest_share,
              proposed_share_neg : groupReducedResult.proposed_share_neg,
              pass_share_neg : groupReducedResult.pass_share_neg,
              invest_share_neg : groupReducedResult.invest_share_neg
            };
            if (groupResult[groupCombineKey]) {
              groupResult[groupCombineKey].proposed_share += groupInstance.proposed_share;
              groupResult[groupCombineKey].pass_share += groupInstance.pass_share;
              groupResult[groupCombineKey].invest_share += groupInstance.invest_share;

              groupResult[groupCombineKey].proposed_share_neg += groupInstance.proposed_share_neg;
              groupResult[groupCombineKey].pass_share_neg += groupInstance.pass_share_neg;
              groupResult[groupCombineKey].invest_share_neg += groupInstance.invest_share_neg;
            } else {
              groupResult[groupCombineKey] = groupInstance;
            }
          }
        } // for each group
      } // for each reduced result

      result.pass_target_ratio = result.pass_amount_total / 100000;
      result.invest_target_ratio = result.invest_amount_total / 100000;
      result.pass_meeting_ratio = result.pass_count / result.proposed_count;

      // result.group = groupResult;  -> save to Collection.Dashboard
      Collections.GroupDashBoard.remove({});
      for (var groupKey in groupResult) {
        var groupIdx = groupKey.split("+")[0];
        var projectTypeIdx = groupKey.split("+")[1];
        var projectTypeName = "";
        for (var typeIdx = 0 ; typeIdx < Meteor.myConstants.project_type.length; typeIdx++ ) {
          type = Meteor.myConstants.project_type[typeIdx];
          if (projectTypeIdx == type.value) {
            projectTypeName = type.label;
            break;
          }
        }
        targetObject = {
          group: groupIdx,
          //project_type: projectTypeIdx,
          project_type: projectTypeName,
          proposed_share: groupResult[groupKey].proposed_share,
          pass_share: groupResult[groupKey].pass_share,
          invest_share: groupResult[groupKey].invest_share,
          proposed_share_neg: groupResult[groupKey].proposed_share_neg,
          pass_share_neg: groupResult[groupKey].pass_share_neg,
          invest_share_neg: groupResult[groupKey].invest_share_neg
        };

        var collectionFindKey = {
          "group": groupIdx,
          "project_type": projectTypeName
        };

        var searched = GroupDashBoard.find(collectionFindKey);
        if (searched) {
          GroupDashBoard.insert(targetObject);
        } else {
          GroupDashBoard.update(
            collectionFindKey,
            {upsert: false},
            {$set:targetObject }
          );
        }

      }
      //result.group = Collections.GroupDashBoard;
      //console.log(groupResult);
      //console.log(GroupDashBoard.find().count());
      return result;
    }
  });

}
