Schemas = {};
Collections = {};
TabularTables = {};

/////////////////////////////////////////////////////////////////////
///// Project Schema
/////////////////////////////////////////////////////////////////////
Schemas.Project = new SimpleSchema({
  projectID : {  // = project.projectID
    type: String,
    label: "项目编号",
    optional:true
  },
  project_full_name: {
    type: String,
    label: "项目全称",
    optional:true
  },
  project_short_name: {
    type: String,
    label: "项目简称",
    optional:true
  },
  project_alias_name: {
    type: String,
    label: "项目代称",
    optional:true
  },
  project_type: {
    type: String,
    label:"项目类别",
    optional:true,
    autoform: {
      type: "select",
      options: function() {
        return [
          {label: "一级股权", value: "equity"},
          {label: "二级股票", value: "stock"},
          {label: "二级债券", value: "bond"},
          {label: "地产", value: "estate"},
          {label: "基金设立", value: "fund"},
          {label: "影视", value: "movie"},
          {label: "其他", value: "other"}
        ]
      }
    }
  },
  system_status: {  // = project.phase (L6)
    type: String,
    label: "投管系统项目状态",
    optional:true
  },
  group: { // = project.manage_plat (L20)
    type: String,
    label: "团队",
    optional:true
  },
  group_product: {
    type: String,
    label: "团队-产品线",
    optional:true
  },
  union_group: { // = project.union_group (L21)
    type: String,
    label: "联合团队",
    optional:true
  },
  consult_group: { // = project.consult_group (L22)
    type: String,
    label: "通融团队",
    optional:true
  },
  group_cnt: {
    type: String,
    label: "团队数",
    optional:true
  },
  project_name: {  // = project.short_name (L3)
    type: String,
    label: "项目名称",
    optional:true
  },
  target_company: {
    type: String,
    label: "目标公司",
    optional:true
  },
  place: {  // = project.country, perf, city (L16,17,18)
    type: String,
    label: "投资区域",
    optional:true
  },
  industry: { // = project.industry (L19)
    type: String,
    label: "所属行业",
    optional:true
  },
  strategy_label: {
    type: String,
    label: "战略标签",
    optional:true
  },
  manage_plat: { // = project.manage_plat(L20)
    type: String,
    label: "管理平台",
    optional:true
  },
  project_manager: { // = project.project_manager (L23)
    type: String,
    label: "项目主负责人",
    optional:true
  },
  currency: {  //= project.currency (L33)
    type: String,
    label: "币种",
    optional: true,
    autoform: {
      type: "select",
      options: function() {
        return Meteor.myConstants.currency;
      }
    }
  },
  proposed_condition: {
    type: String,
    label: "提报条件",
    optional:true,
  },
  proposed_amount: {
    type: Number,
    label: "提报金额（原币/千元）",
    optional: true,
    regEx: /^[0-9]*$/i
  },
  proposed_amount_CNY: {
    type: Number,
    label: "提报金额（人名币/千元）",
    optional: true,
    regEx: /^[0-9]*$/i
  },
  pass_or_not: {
    type: String,
    label: "是否过会",
    optional:true,
    autoform: {
      type: "select",
      options: function() {
        return [
          {label: "是", value: "pass"},
          {label: "跟进", value: "progress"},
          {label: "否", value: "fail"}
        ]
      }
    }
  },
  pass_date: {
    type: String,
    label: "过会时间",
    optional:true,
    autoform: {
      afFieldInput: {
        type: "bootstrap-datepicker",
        datePickerOptions: {
          format: "yyyy-mm-dd",
          language: "zh-CN"
        }
      }
    }
  },
  pass_condition: {
    type: String,
    label: "过会条件（价格等）",
    optional:true
  },
  pass_invest: {
    type: Number,
    label: "过会投资金额（原币/千元）",
    optional:true,
    regEx: /^[0-9]*$/i
  },
  pass_invest_CNY: {
    type: Number,
    label: "过会投资金额（人民币/千元）",
    optional: true,
    regEx: /^[0-9]*$/i
  },
  proposed_invest_plat: {
    type: String,
    label: "拟出资平台",
    optional:true
  },
  pre_money: {
    type: Number,
    label: "投前估值/原币",
    optional:true,
    regEx: /^[0-9]*$/i
  },
  post_money: {
    type: Number,
    label: "投后估值/原币",
    optional:true,
    regEx: /^[0-9]*$/i
  },
  post_deal_share: {
    type: String,
    label: "投后股比",
    optional:true
  },
  contract_or_not: {
    type: String,
    label: "是否签约",
    optional:true,
    autoform: {
      type: "select",
      options: function() {
        return [
          {label: "是", value: "yes"},
          {label: "否", value: "no"}
        ]
      }
    }
  },
  contract_date: {
    type: String,
    label: "签约/交割时间",
    optional:true,
    autoform: {
      afFieldInput: {
        type: "bootstrap-datepicker",
        datePickerOptions: {
          format: "yyyy-mm-dd",
          language: "zh-CN"
        }
      }
    }
  },
  invest_or_not: {
    type: String,
    label: "是否出资",
    optional:true,
    autoform: {
      type: "select",
      options: function() {
        return [
          {label: "是", value: "yes"},
          {label: "否", value: "no"}
        ]
      }
    }
  },
  invest_date: {
    type: String,
    label: "出资时间",
    optional:true,
    autoform: {
      afFieldInput: {
        type: "bootstrap-datepicker",
        datePickerOptions: {
          format: "yyyy-mm-dd",
          language: "zh-CN"
        }
      }
    }
  },
  invest_plat: {  // = project.invest_entity (L31)
    type: String,
    label: "出资平台",
    optional:true
  },
  real_pay: {
    type: Number,
    label: "实际付款（原币/千元）",
    optional:true,
    regEx: /^[0-9]*$/i
  },
  real_pay_CNY: {
    type: Number,
    label: "实际付款（人民币/千元）",
    optional:true,
    regEx: /^[0-9]*$/i
  },
  note_bond: { // = project.note_bond : (L40)
    type: String,
    label: "出资计划备注",
    optional:true
  }
});


/////////////////////////////////////////////////////////////////////
///// Outlook Schedule
/////////////////////////////////////////////////////////////////////
Schemas.OutlookSchedule = new SimpleSchema({
  projectID: {
    type: String,
    label: "项目编号",
    optional: true
  },
  meeting_type: {
    type: String,
    label: "会议类别",
    optional: true
  },
  meeting_group: {
    type: String,
    label: "团队（全）",
    optional: true
  },
  meeting_system: {
    type: String,
    label: "会议频度",
    optional: true
  },
  meeting_organizer: {
    type: String,
    label: "会议组织者",
    optional: true
  },
  meeting_title: {
    type: String,
    label: "会议名称",
    optional: true
  },
  meeting_date : {
    type: String,
    label: "会议时间",
    optional: true,
    autoform: {
      afFieldInput: {
        //type: "date"
        type: "bootstrap-datepicker",
        datePickerOptions: {
          format: "yyyy-mm-dd",
          language: "zh-CN"
        }
      }
    }
  },
  meeting_result: {
    type: String,
    label: "会议结果",
    optional: true,
    autoform: {
      afFieldInput: {
        type: "textarea",
        rows: 5
      }
    }
  },
  meeting_pass: {
    type: String,
    label: "是否过会",
    optional: true,
    autoform: {
      type: "select",
      options: function() {
        return [
          {label: "是", value: "pass"},
          {label: "跟进", value: "progress"},
          {label: "否", value: "fail"}
        ]
      }
    }
  },
  meeting_comment: {
    type: String,
    label: "备注",
    optional: true
  }
});

/////////////////////////////////////////////////////////////////////
///// Most Important
///// Meeting: OutlookSchedule + Project Schema
/////////////////////////////////////////////////////////////////////
Schemas.Meeting = new SimpleSchema([Schemas.OutlookSchedule, Schemas.Project]);


//////////////////////////////////////////////////////////////////////
// Dashboard group metrics schema
//////////////////////////////////////////////////////////////////////
Schemas.GroupDashBoard = new SimpleSchema({
  group : {
    type: String,
    label: "团队",
    optional:true
  },
  project_type: {
    type: String,
    label: "项目类型",
    optional: true
  },
  proposed_share: {
    type: String,
    label: "提报投决金额总计",
    optional:true
  },
  pass_share: {
    type: String,
    label: "过会金额总计",
    optional:true
  },
  invest_share: {
    type: String,
    label: "出资金额总计",
    optional:true
  },
  proposed_share_neg: {
    type: String,
    label: "提报投决（退出）金额总计",
    optional:true
  },
  pass_share_neg: {
    type: String,
    label: "过会（退出）金额总计",
    optional:true
  },
  invest_share_neg: {
    type: String,
    label: "出资（退出）金额总计",
    optional:true
  }
});

/////////////////////////////////////////////////////////////////////
///// Collections
/////////////////////////////////////////////////////////////////////
//var Collections = {};

// Outlook schedule
OutlookSchedule = Collections.OutlookSchedule = new Mongo.Collection("OutlookSchedule");
OutlookSchedule.attachSchema(Schemas.OutlookSchedule);

// PROJECT with ProjectID
Projects = Collections.Projects = new Mongo.Collection("Project");
Projects.attachSchema(Schemas.Project);

// FULL
Meetings = Collections.Meetings = new Mongo.Collection("Meeting");
Meetings.attachSchema(Schemas.Meeting);

// for Dashboard (by group)
GroupDashBoard = Collections.GroupDashBoard = new Mongo.Collection("GroupDashBoard");
GroupDashBoard.attachSchema(Schemas.GroupDashBoard);

/////////////////////////////////////////////////////////////////////
///// Table to show the list of meetings
/////////////////////////////////////////////////////////////////////
//var TabularTables = {};

TabularTables.MeetingTable = new Tabular.Table({
  name: "Meetings",
  collection: Collections.Meetings,
  stateSave: true,
  columns: [
    {data: "meeting_type", title: "会议类别", width: "15%"},
    {data: "meeting_group", title: "团队", width: "20%"},
    {data: "meeting_title", title: "会议名称", width: "30%"},
    {data: "meeting_date", title: "会议时间", width: "15%"},
    {
      data: "meeting_pass",
      title: "Pass?",
      searchable: true,
      width: "5%",
      tmpl: Meteor.isClient && Template.passDescription
    },
    {
      width: "5%",
      tmpl: Meteor.isClient && Template.selectMeeting
    },
    {
      width: "5%",
      tmpl: Meteor.isClient && Template.deleteMeeting
    }
  ]
});

TabularTables.GroupDashBoardTable = new Tabular.Table({
  name: "GroupDashBoard",
  collection: Collections.GroupDashBoard,
  stateSave: true,
  columns: [
    {data: "group", title: "团队", width: "25%"},
    {data: "project_type", title: "项目类型", width: "15%"},
    {data: "proposed_share", title: "提报投决金额总计", width: "10%"},
    {data: "pass_share", title: "过会金额总计", width: "10%"},
    {data: "invest_share", title: "出资金额总计", width: "10%"},
    {data: "proposed_share_neg", title: "提报投决（退出）金额总计", width: "10%"},
    {data: "pass_share_neg", title: "过会（退出）金额总计", width: "10%"},
    {data: "invest_share_neg", title: "出资（退出）金额总计", width: "10%"}
  ]
});
