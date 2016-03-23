
function pad(n){
  return n < 10 ? '0' + n : n ;
}


// SYSTEM ENTIRE Json file => fill up the project object
var json_to_projectObj = function (jsonObj) {
  if (jsonObj) {
    var country = jsonObj[15] ? jsonObj[15].trim() : "";
    var perf = jsonObj[16] ? jsonObj[16].trim() : "";
    var city = jsonObj[17] ? jsonObj[17].trim() : "";
    var place = country + " " + perf + " " + city;

    var group_count = 1;
    if (jsonObj[19]) {  // group column
      if(jsonObj[20]) {// union column
        var group_length = jsonObj[20].split("&").length;
        if(group_length) {
          group_count = 1 + group_length;
        }
      }
    }
    return {
      projectID : jsonObj[1] ? jsonObj[1] : "N/A",
      project_full_name: jsonObj[0] ? jsonObj[0] : "N/A",
      project_short_name: jsonObj[2] ? jsonObj[2] : "N/A",
      project_alias_name: jsonObj[3] ? jsonObj[3] : "N/A",
      project_type : "other",
      system_status : jsonObj[5] ? jsonObj[5] : "N/A",
      group : jsonObj[19] ? jsonObj[19] : "N/A",
      group_product : "N/A",
      union_group : jsonObj[20] ? jsonObj[20].split("&") : ["N/A"],
      consult_group : jsonObj[21] ? jsonObj[21] : "N/A",
      group_cnt : group_count,
      project_name : jsonObj[2] ? jsonObj[2] : "N/A",
      target_company : jsonObj[0] ? jsonObj[0] : "N/A",
      place: place.trim() != "" ? place.trim() : "N/A",
      industry : jsonObj[18] && jsonObj[18].trim() != "" ? jsonObj[18] : "N/A",
      strategy_label: "N/A",
      proposed_condition: "N/A",
      manage_plat : jsonObj[19] && jsonObj[19].trim() != "" ? jsonObj[19] : "N/A",
      project_manager : jsonObj[22] ? jsonObj[22] : "N/A",
      proposed_amount : 0,
      proposed_amount_CNY: 0,
      pass_or_not : "progress",
      pass_date : "N/A",
      pass_condition : "N/A",
      currency : jsonObj[32] ? jsonObj[32] : "N/A",
      pass_invest : 0,
      pass_invest_CNY : 0,
      proposed_invest_plat : "N/A",
      pre_money : 0,
      post_money : 0,
      post_deal_share : "N/A",
      contract_or_not : "no",
      contract_date : "N/A",
      invest_or_not : "N/A",
      invest_date : "N/A",
      invest_plat : jsonObj[30] ? jsonObj[30] : "N/A",
      real_pay : 0,
      real_pay_CNY : 0,
      note_bond : jsonObj[39] ? jsonObj[39] : "N/A",
    }
  }
};

var InitInvestSystem = function (dirInfo, fileInfo) {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var basepath = path.resolve('.').split('.meteor')[0];

  // Get excel
  console.log("Getting xlsx...");
  var excel = new Excel('xlsx');
  //var workbook = excel.readFile(basepath + "private\\BasicProjectsInfo.xlsx");
  var workbook = excel.readFile(basepath + dirInfo + "/" + fileInfo.name);
  var sheetName = workbook.SheetNames;
  var sheet = workbook.Sheets[workbook.SheetNames[0]];
  var options = { header : 1 }
  // Generate the JSON
  var workbookJson = excel.utils.sheet_to_json( sheet, options );

  console.log("Project Counts: " + workbookJson.length);
  // insert json into Meetings Collection without duplication
  for (var i = 0 ; i < workbookJson.length; i++ ) {
    var projectInstance = json_to_projectObj(workbookJson[i]);
    if (projectInstance) {
      Projects.insert(projectInstance);
    }
  }
  console.log("Project Collections Imported: " + Projects.find().count());
};


///////////////////////////////////
// Upload Outlook Schedule
///////////////////////////////////
// OUTLOOK file logic related.
var json_to_scheduleObj = function (jsonObj) {
  if (jsonObj) {
    var meet_title = jsonObj[0];//jsonObj["主题"];
    var separateLeftBrace = meet_title.indexOf("【");
    var separateRightBrace = meet_title.indexOf("】");
    if (separateLeftBrace != -1 && separateRightBrace != -1) {
      var meet_key_info = meet_title.substring(separateLeftBrace + 1, separateRightBrace);
      var splits = meet_key_info.split("-");
      var meet_type = splits[0];
      var meet_system = "";
      if (splits.length > 1) {
        meet_system = splits[1];
      }

      var separateSpace = meet_title.indexOf(" ");
      if (separateSpace <= separateLeftBrace ) {  // space should be higher than ]
        separateSpace = meet_title.substring(separateRightBrace, meet_title.length).indexOf(" ");
      }
      var meet_group = "N/A";
      var title_body = "N/A";
      if (separateSpace != -1) {
        meet_group = meet_title.substring(separateRightBrace + 1, separateSpace);
        title_body = meet_title.substring(separateSpace + 1, meet_title.length);
      } else {
        // no space
        if (separateRightBrace < meet_title.length - 1 ) {
          title_body = meet_title.substring(separateRightBrace + 1, meet_title.length);
        }
      }
      if (!title_body)  title_body = "N/A";
      return {
        projectID: "N/A",
        meeting_type: meet_type && meet_type.trim() != "" ? meet_type.trim() : "N/A",
        meeting_group: meet_group && meet_group.trim() != "" ? meet_group.trim() : "N/A",
        meeting_system: meet_system && meet_system.trim() != "" ? meet_system.trim() : "N/A",
        meeting_organizer: jsonObj[9] && jsonObj[9].trim() != "" ? jsonObj[9].trim() : "N/A", //jsonObj["会议组织者"],
        meeting_title: title_body && title_body.trim() != "" ? title_body.trim() : "N/A",
        meeting_date: jsonObj[1] ? jsonObj[1].trim().split('/').map(pad).join('-') : "N/A", //jsonObj["开始日期"],
        meeting_result: "N/A",
        meeting_pass: "progress",
        meeting_comment: "N/A"
      }
    }
  }
};

var fillUpProjectInfo = function(origin, projectInfo) {
  for(var k in Schemas.Project.schema()) {
    origin[k] = projectInfo[k];
  }
  return origin;
};

var InitOutlookSchedule = function(dirInfo, fileInfo) {
  //console.log(formFields);
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var basepath = path.resolve('.').split('.meteor')[0];

  // Get excel
  var excel = new Excel('xlsx');
  var workbook = excel.readFile(basepath + dirInfo + "/" + fileInfo.name);
  var sheetName = workbook.SheetNames;
  var sheet = workbook.Sheets[workbook.SheetNames[0]];
  var options = { header : 1 }
  // Generate the JSON
  var workbookJson = excel.utils.sheet_to_json( sheet, options );

  console.log("OutlookRecords: " + workbookJson.length);
  // insert json into Meetings Collection without duplication
  for (var i = 0 ; i < workbookJson.length; i++ ) {
    var scheduleInstance = json_to_scheduleObj(workbookJson[i]);
    if (scheduleInstance) {
      var found;
      if (scheduleInstance["title"] != " ") {
        found = OutlookSchedule.find({
          "meeting_title": scheduleInstance["meeting_title"],
          "meeting_type": scheduleInstance["meeting_type"],
          "meeting_date": scheduleInstance["meeting_date"]});
      } else {
        found = OutlookSchedule.find({
          "meeting_type": scheduleInstance["meeting_type"],
          "meeting_date": scheduleInstance["meeting_date"]});
      }

      if (found.count() <= 0) {
        OutlookSchedule.insert(scheduleInstance);
        /*
        console.log("Start to Combine...Outlook x Project -> Meetings");
        // Combine Meetings and Projects
        var projectCursor = Projects.findOne();
        for (var index = 0; index < projectCursor.length; index++) {
          var project = projectCursor[index];
          var short_name = project["project_short_name"];
          var alias_name = project["project_alias_name"];
          var full_name = project["project_full_name"];
          //var pattern = "(" + short_name + "|" + alias_name + "|" + full_name + ")";
          var pattern = "/" + short_name + "|" + alias_name + "|" + full_name + "/i";
          if (scheduleInstance["meeting_title"].match(short_name)) {
            scheduleInstance = fillUpProjectInfo(scheduleInstance,project);
            break;
          }
        }
        */
        //Meetings.insert(outlookScheduleInstance);
        //console.log("Done!");
      }
    }
  }
  console.log("Schedules: " + OutlookSchedule.find().count());
}


///////////////////////////////////
// Generate entire Report Meeting
// (Schedule+Project combined)
// Field List Meteor.myConstants.selectedFields
///////////////////////////////////
var json_to_reportObj = function (jsonObj) {
  var instance = {};
  if (jsonObj) {
    var headers = Meteor.myConstants.selectedFields;
    for (var index = 0 ; index < headers.length; index++) {
      instance[headers[index]] = jsonObj[index];
    }
  }
  return instance;
};

var ReCreateMeetingCollection = function (fileName) {
  console.log("Importing Entire Meeting xlsx...");
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var basepath = path.resolve('.').split('.meteor')[0];
  var excel = new Excel('xlsx');
  var workbook = excel.readFile(basepath + "uploads\\" + fileName);
  var sheetName = workbook.SheetNames;
  var sheet = workbook.Sheets[workbook.SheetNames[0]];
  var options = { header : 1 }
  // Generate the JSON
  var workbookJson = excel.utils.sheet_to_json( sheet, options );

  console.log("Meeting Counts: " + workbookJson.length);
  var failedInstance = [];
  for (var i = 0 ; i < workbookJson.length; i++ ) {
    var meetingInstance = json_to_reportObj(workbookJson[i]);
    if (meetingInstance) {
      try {
        Meetings.insert(meetingInstance);
      } catch (err) {
        console.log("Error Import Occurred!");
        console.log(err.sanitizedError.reason);
        failedInstance.push(meetingInstance);
      }
    }
  }
  console.log("Meeting Collections Imported: " + Meetings.find().count());
  return failedInstance;
};


////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
// TODO: move to /client/init.js
///////////////////////////////////////////////////////
if (Meteor.isClient) {

  Meteor.startup(function() {

  });

}

// TODO: move to /server/init.js
if (Meteor.isServer) {
  Meteor.startup(function () {

    //Inject.rawModHtml('doSomething', function(html) {
    //  return html.replace(/<html>/, '<!-- HTML 5 -->\n<html class="no-js" lang="en">');
    //});

    // TODO: need comment out the following two statements.
    //Meetings.remove({});
    //Projects.remove({});
    GroupDashBoard.remove({});

    // get data from system database
    console.log("Existing Project #:" + Projects.find().count());
    //if (Projects.find().count() == 0 ) {
    //  InitInvestSystem();
    //}

    // Initialize uploader for meeeting information
    //var baseDir = process.env.PWD ? process.env.PWD + "/uploads" : "/uploads";
    var baseDir = "";
    if (process.env.PWD) {
      baseDir = process.env.PWD + "/uploads";
      tempDir = baseDir + "/tmp";
    } else {
      var path = Npm.require('path');
      baseDir = path.resolve('.').split('.meteor')[0] + "uploads";
      tempDir = baseDir + "\\tmp";
    }

    // outlook schedule uploader (OutlookSchedule schema)
    UploadServer.init({
      uploadUrl: "/upload/",
      tmpDir: tempDir,
      uploadDir: baseDir,
      checkCreateDirectories: true,  // create the directories for you
      overwrite: true,

      validateRequest: function(req) { // valid BEFORE it starts uploading
        if (req.headers["content-length"] > 50000000) {
            return "File is too large!";
        }
        return null;
      },
      validateFile: function(file, req) { // validate the integrity of uploaded file AFTER it was uploaded
        console.log("Validating " + file.name);
        var splits = file.name.split(".");
        if (splits && splits.length && splits.length >= 2) {
          surfix = splits[splits.length - 1];
          if (surfix != "xlsx") {
            return "Support XLSX file ONLY!";
          }
        } else {
          return "Not Valid File!";
        }
        return null;
      },

      finished: function(fileInfo, formFields) {
        //console.log(fileInfo);
        var uploadType = formFields['uploadType'];
        if (uploadType == 'schedule_upload') {
          console.log("Adding New Outlook Schedule...");
          InitOutlookSchedule("uploads", fileInfo);
        } else if (uploadType == 'invest_upload') {
          console.log("Adding New Investment Project Information...");
          Projects.remove({});
          InitInvestSystem("uploads", fileInfo);
        } else if (uploadType == 'report_upload') {
          console.log("Cover Report Data(total)...");
          Meetings.remove({});
          var failedInstance = ReCreateMeetingCollection(fileInfo.name);
          return failedInstance;
        } else {
          console.log("Unknown Upload controller");
        }
      }
    });
  }); // startup server function

}



////////////////////////////////////////////////////
// back up uploader getDirectory and getFileName
      /*
      getDirectory: function (fileInfo, formData) {
        console.log(formData);
        if (formData && formData.directoryName != null) {
            return formData.directoryName;
        }
        return "";
      },
      getFileName: function (fileInfo, formData) {
        // to prevent unicode file name problem
        var fileName = fileInfo.name;
        var extensions = fileName.split('.');
        var extension = extensions[extensions.length - 1];

        // prevent duplicated file name
        var stamp = new Date().valueOf();
        fileName = stamp + "_" + Base64.encode(fileName) + '.' + extension; // Filename with extension

        if (formData && formData.prefix != null) {
            return formData.prefix + '_' + fileName;
        }
        return fileName;
      },
      */
