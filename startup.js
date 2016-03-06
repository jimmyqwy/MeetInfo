
function pad(n){
  return n < 10 ? '0' + n : n ;
}


// SYSTEM ENTIRE Json file => fill up the project object
var json_to_projectObj = function (jsonObj) {
  if (jsonObj) {
    return {
      projectID : jsonObj[1],
      project_full_name: jsonObj[0],
      project_short_name: jsonObj[2],
      project_alias_name: jsonObj[3],
      project_type : "other",
      system_status : jsonObj[5],
      group : jsonObj[19],
      group_product : "",
      union_group : jsonObj[20],
      consult_group : jsonObj[21],
      group_cnt : 1,
      project_name : jsonObj[2],
      target_company : "",
      industry : jsonObj[18],
      manage_plat : jsonObj[19],
      project_manager : jsonObj[22],
      proposed_amount : 0,
      pass_or_not : "progress",
      pass_date : "",
      pass_condition : "",
      currency : jsonObj[32],
      pass_invest : 0,
      pass_invest_CNY : 0,
      proposed_invest_plat : "",
      pre_money : 0,
      post_money : 0,
      post_deal_share : "",
      contract_or_not : "no",
      contract_date : "",
      invest_or_not : "",
      invest_date : "",
      invest_plat : jsonObj[30],
      real_pay : 0,
      real_pay_CNY : 0,
      note_bond : jsonObj[39]
    }
  }
};

var InitInvestSystem = function () {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var basepath = path.resolve('.').split('.meteor')[0];

  // Get excel
  console.log("Getting xlsx...");
  var excel = new Excel('xlsx');
  var workbook = excel.readFile(basepath + "private\\BasicProjectsInfo.xlsx");
  var sheetName = workbook.SheetNames;
  var sheet = workbook.Sheets[workbook.SheetNames[0]];
  var options = { header : 1 }
  // Generate the JSON
  var workbookJson = excel.utils.sheet_to_json( sheet, options );

  console.log("Project Counts: " + workbookJson.length);
  // insert json into Meetings Collection without duplication
  for (var i = 0 ; i < workbookJson.length; i++ ) {
    var meetInstance = json_to_projectObj(workbookJson[i]);
    if (meetInstance) {
      Projects.insert(meetInstance);
    }
  }
  console.log("Project Collections: " + Projects.find().count());
};


// OUTLOOK file logic related.
var json_to_meetObj = function (jsonObj) {
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
      var meet_group = " ";
      var title_body = " ";
      if (separateSpace != -1) {
        meet_group = meet_title.substring(separateRightBrace + 1, separateSpace);
        title_body = meet_title.substring(separateSpace + 1, meet_title.length);
      } else {
        // no space
        if (separateRightBrace < meet_title.length - 1 ) {
          title_body = meet_title.substring(separateRightBrace + 1, meet_title.length);
        }
      }
      if (!title_body)  title_body = " ";
      return {
        projectID: "",
        meeting_type: meet_type,
        meeting_group: meet_group,
        meeting_system: meet_system,
        meeting_organizer: jsonObj[9], //jsonObj["会议组织者"],
        meeting_title: title_body,
        meeting_date: jsonObj[1].split('/').map(pad).join('-'), //jsonObj["开始日期"],
        meeting_result: "",
        meeting_pass: "progress",
        meeting_comment: ""
      }
    }
  }
};

var fillUpProjectInfo = function(projectInfo) {
  resultJson = {};
  for(var k in Schemas.Project.schema()) {
    resultJson[k] = projectInfo[k];
  }
  return resultJson;
};

var InitMeetings = function(fileInfo) {
  //console.log(formFields);
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var basepath = path.resolve('.').split('.meteor')[0];

  // Get excel
  var excel = new Excel('xlsx');
  var workbook = excel.readFile(basepath + "uploads/" + fileInfo.name);
  var sheetName = workbook.SheetNames;
  var sheet = workbook.Sheets[workbook.SheetNames[0]];
  var options = { header : 1 }
  // Generate the JSON
  var workbookJson = excel.utils.sheet_to_json( sheet, options );

  console.log("OutlookRecords: " + workbookJson.length);
  // insert json into Meetings Collection without duplication
  for (var i = 0 ; i < workbookJson.length; i++ ) {
    var meetInstance = json_to_meetObj(workbookJson[i]);
    if (meetInstance) {
      var found;
      if (meetInstance["title"] != " ") {
        found = Meetings.find({
          "meeting_title": meetInstance["meeting_title"],
          "meeting_type": meetInstance["meeting_type"],
          "meeting_date": meetInstance["meeting_date"]});
      } else {
        found = Meetings.find({
          "meeting_type": meetInstance["meeting_type"],
          "meeting_date": meetInstance["meeting_date"]});
      }

      if (found.count() <= 0) {
        Meetings.insert(meetInstance);
        //console.log(meetInstance["meeting_date"]);
        //console.log(meetInstance["meeting_group"]);
        //console.log(meetInstance["meeting_title"]);
      } else {
        //console.log(meetInstance["title"]);
        //console.log(meetInstance["date"]);
      }
    } else {
      // console.log(workbookJson[i]);
    }
  }
  console.log("Meetings: " + Meetings.find().count());


  console.log("Start to Combine...");
  // Combine Meetings and Projects
  Projects.find().forEach(function(project) {
    var short_name = project["project_short_name"];
    var alias_name = project["project_alias_name"];
    var full_name = project["project_full_name"];
    var pattern = "(" + short_name + "|" + alias_name + "|" + full_name + ")";
    // fill up meeting info with detailed project info
    Meetings.update({"meeting_title": {$regex: short_name, $options: 'i'} },
                    { $set: fillUpProjectInfo(project)},
                    {upsert: false});
  });
  console.log("Done!");
}


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

    // TODO: need comment out the following two statements.
    Meetings.remove({});
    //Projects.remove({});

    // get data from system database
    console.log("Project #:" + Projects.find().count());
    if (Projects.find().count() == 0 ) {
      InitInvestSystem();
    }

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

    UploadServer.init({
      tmpDir: tempDir,
      uploadDir: baseDir,
      checkCreateDirectories: true,  // create the directories for you
      overwrite: true,

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

      finished: function(fileInfo, formFields) {
        InitMeetings(fileInfo);
      }
    });

  }); // startup server function

}
