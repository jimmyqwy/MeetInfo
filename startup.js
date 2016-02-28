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
  }); // startup server function
}
