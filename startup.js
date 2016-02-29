var local_meeting_data = [
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


// TODO: move to /client/init.js
if (Meteor.isClient) {
  Uploader.localisation = {
    browse: "Upload Outlook Schedule"
  }
}

// TODO: move to /server/init.js
if (Meteor.isServer) {
  Meteor.startup(function () {

    //EntireData.remove({});
    Meetings.remove({}); // targets (for editing based on searched results)
    if (Meetings.find().count() == 0) {
      for ( var i = 0 ; i < local_meeting_data.length; i++ ) {
        Meetings.insert(local_meeting_data[i]);
      }
    }  // end of if have no meetings
    console.log("Startup :" + Meetings.find().count());


    // Initialize uploader
    UploadServer.init({
      tmpDir: process.env.PWD + "/uploads/tmp",
      uploadDir: process.env.PWD + "/uploads/",
      checkCreateDirectories: true,  // create the directories for you
      finished: function(fileInfo, formFields) {
        console.log(fileInfo);
        var fs = Npm.require('fs');
        var path = Npm.require('path');
        var basepath = path.resolve('.').split('.meteor')[0];
        //console.log(basepath);

        var excel = new Excel('xlsx');
        var workbook = excel.readFile(basepath + "uploads/" + fileInfo.name);
        var sheetName = workbook.SheetNames;

        //console.log("!!" + workbook.SheetNames[0]);
        var sheet = workbook.Sheets[workbook.SheetNames[0]];
        var options = { header : 1 }
        // Generate the JSON
        var workbookJson = excel.utils.sheet_to_json( sheet, options );
        console.log(workbookJson);
      }
    });

  }); // startup server function

}
