/*var local_meeting_data = [
  {
    ID: "1",
    projectID: "JTDK011300013",
    type: "Decision",
    group: "Insurance",
    system: "Investigate",
    organizer: "YE FEI",
    title: "Many Details",
    date: "2016-01-01",
    result: "blank",
    pass: true,
    comment: "comments"
  },
  {
    ID: "2",
    projectID: "JTDK011300013",
    type: "Decision",
    group: "Insurance2",
    system: "Investigate2",
    organizer: "YE FEI",
    title: "Many Details2",
    date: "2016-01-02",
    result: "blank",
    pass: true,
    comment: "comments"
  },
  {
    ID: "3",
    projectID: "JTDK011300013",
    type: "Decision",
    group: "Insurance3",
    system: "Investigate3",
    organizer: "YE FEI",
    title: "Many Details3",
    date: "2016-01-03",
    result: "blank",
    pass: true,
    comment: "comments"
  },
  {
    ID: "4",
    projectID: "JTDK011500025",
    type: "Decision",
    group: "Insurance4",
    system: "Investigate4",
    organizer: "YE FEI",
    title: "Many Details4",
    date: "2016-01-04",
    result: "blank",
    pass: true,
    comment: "comments"
  },
  {
    ID: "5",
    projectID: "JTDK015500099",
    type: "Decision",
    group: "Insurance5",
    system: "Investigate5",
    organizer: "YE FEI",
    title: "Many Details5",
    date: "2016-01-05",
    result: "blank",
    pass: true,
    comment: "comments"
  }
];
*/

function pad(n){
  return n < 10 ? '0' + n : n ;
}

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
        type: meet_type,
        group: meet_group,
        system: meet_system,
        organizer: jsonObj[9], //jsonObj["会议组织者"],
        title: title_body,
        date: jsonObj[1].split('/').map(pad).join('-'), //jsonObj["开始日期"],
        result: "",
        pass: "progress",
        comment: ""
      }
    }
  }
};


// TODO: move to /client/init.js

if (Meteor.isClient) {

  Meteor.startup(function() {

  });

}

// TODO: move to /server/init.js
if (Meteor.isServer) {
  Meteor.startup(function () {

    //EntireData.remove({});
    Meetings.remove({}); // targets (for editing based on searched results)
    /*if (Meetings.find().count() == 0) {
      for ( var i = 0 ; i < local_meeting_data.length; i++ ) {
        Meetings.insert(local_meeting_data[i]);
      }
    }  // end of if have no meetings
    console.log("Startup :" + Meetings.find().count());
    */

    // Initialize uploader
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
                "title": meetInstance["title"],
                "type": meetInstance["type"],
                "date": meetInstance["date"]});
            } else {
              found = Meetings.find({
                "type": meetInstance["type"],
                "date": meetInstance["date"]});
            }

            if (found.count() <= 0) {
              Meetings.insert(meetInstance);
              console.log(meetInstance["date"]);
              console.log(meetInstance["group"]);
              console.log(meetInstance["title"]);
            } else {
              //console.log(meetInstance["title"]);
              //console.log(meetInstance["date"]);
            }
          } else {
            // console.log(workbookJson[i]);
          }
        }
        console.log("Meetings: " + Meetings.find().count());
      }
    });

  }); // startup server function

}
