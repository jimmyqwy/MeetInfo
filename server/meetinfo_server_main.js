
  //DashBoard = Collections.DashBoard = new Mongo.Collection("DashBoard");
  DashBoard = new Mongo.Collection("DashBoard");
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
      //console.log(Meetings.find({projectID:'JTJK011600048'}).fetch());

      var reportMap = function() {  // map

        var key = this.projectID;

        var projectStatus = 0;
        if (this.meeting_pass == "fail") {
          projectStatus = 0;   // fail
        } else if (this.meeting_pass == "pass") {
          projectStatus = 1;   // pass
        } else {
          projectStatus = 2;   // progress
        }

        var singleValue = {
          meeting_date: new Date(this.meeting_date),
          meeting_type: this.meeting_type,
          project_type: this.project_type,
          project_ID: this.projectID,
          project_status: projectStatus,

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

        var num_proposed_amount = isNaN(this.proposed_amount_CNY) ? 0 : Number(this.proposed_amount_CNY);
        var num_pass_invest = isNaN(this.pass_invest_CNY) ? 0 : Number(this.pass_invest_CNY);
        var num_real_pay = isNaN(this.real_pay_CNY) ? 0 : Number(this.real_pay_CNY);

        // PROPOSED
        /*if (num_proposed_amount && num_proposed_amount >= 0 ) {
          singleValue.proposed_flag = 1;
          singleValue.proposed_amount = num_proposed_amount;
        } else if (num_proposed_amount && num_proposed_amount < 0) {
          singleValue.proposed_flag_neg = 1;
          singleValue.proposed_amount_neg = num_proposed_amount;
        }*/
        if (num_proposed_amount && num_proposed_amount < 0) {
          singleValue.proposed_flag_neg = 1;
          singleValue.proposed_amount_neg = num_proposed_amount;
        } else {  // no value will also regard as proposed
          singleValue.proposed_flag = 1;
          singleValue.proposed_amount = num_proposed_amount;
        }


        // PASS
        if ( this.meeting_type != "大额尽调审批" ) {
          if (this.meeting_pass == "fail") {
            singleValue.pass_flag = 0;
            singleValue.pass_flag_neg = 0;
            singleValue.pass_invest = 0;
            singleValue.pass_invest_neg = 0;
          } else if (num_pass_invest && num_pass_invest < 0 && this.meeting_pass == "pass") {
            //singleValue.pass_flag_neg = this.meeting_pass == "pass" ? 1 : 2;  // pass or progress
            singleValue.pass_flag_neg = 1;
            singleValue.pass_invest_neg = num_pass_invest;
          } else if (this.meeting_pass == "pass") {
            //else if (this.meeting_pass == "pass") {
            //else if (num_pass_invest && num_pass_invest >= 0 &&
            //  this.meeting_pass == "pass" ) {
            //singleValue.pass_flag = this.meeting_pass == "pass" ? 1 : 2;  // pass or progress
            singleValue.pass_flag = 1;
            singleValue.pass_invest = num_pass_invest;
          }
        }

        // REAL INVEST
        if ((num_real_pay && num_real_pay > 0) || this.invest_or_not == "yes") {
          // if real_pay exist, accumulate proposed and pass amount
          singleValue.invest_flag = 1;
          singleValue.real_pay = num_real_pay;
        } else if (num_real_pay && num_real_pay < 0) {
          // if real_pay exist, accumulate proposed and pass amount
          singleValue.invest_flag_neg = 1;
          singleValue.real_pay_neg = num_real_pay;
        }


        // groups
        groups = [];
        if( this.group ) {
          groups.push(this.group);
        } else if ( !this.union_group || this.union_group.length == 0 ) {  // both group and union_group are empty
          groups.push("NAGroup");
        } //else {  // we have union_group
        if (this.union_group) {
          //var union = this.union_group.split("&").map(function(a){ return a.trim()});
          //for (var i = 0 ; i < union.length; i++) {
          //  groups.push(union[i]);
          //}

          // already array object
          for (var i = 0 ; i < this.union_group.length; i++) {
            groups.push(this.union_group[i]);
          }
        }
        //}

        for (var idx = 0; idx < groups.length; idx++) {
          var groupShare = {};
          groupShare.group = groups[idx];
          //groupShare.group = groupKey;
          groupShare.proposed_share = singleValue.proposed_amount / groups.length;
          groupShare.pass_share = singleValue.pass_invest / groups.length;
          groupShare.invest_share = singleValue.real_pay / groups.length;

          groupShare.proposed_count_share = singleValue.proposed_flag / groups.length;
          groupShare.pass_count_share = singleValue.pass_flag / groups.length;
          groupShare.invest_count_share = singleValue.invest_flag / groups.length;

          groupShare.proposed_share_neg = singleValue.proposed_amount_neg / groups.length;
          groupShare.pass_share_neg = singleValue.pass_invest_neg / groups.length;
          groupShare.invest_share_neg = singleValue.real_pay_neg / groups.length;
          singleValue.groups.push(groupShare);
        }

        // emit
        emit(key, singleValue);
      };

      var reportReduce = function(key, values) {  // reduce
        //return {key: key, values: values};

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
          meeting_type: values[values.length - 1].meeting_type,
          project_type: values[values.length - 1].project_type,
          project_ID: key,

          proposed_flag: 0,
          proposed_flag_neg: 0,
          proposed_amount: 0,
          proposed_amount_neg: 0,

          pass_flag: -1,
          pass_flag_neg: -1,
          pass_invest: 0,
          pass_invest_neg: 0,

          invest_flag:  0,
          invest_flag_neg: 0,
          real_pay: 0,
          real_pay_neg: 0,

          groups: []
        };
        // Groups: { group: "", proposed_share: "",  pass_share: "",   invest_share: "" }
        //var groupMaps = {};
        var groupSet = [];

        // get each phase
        var phase_proposed_amount = 0;
        var phase_proposed_amount_neg = 0;

        var phase_pass_invest = 0;
        var phase_pass_invest_neg = 0;

        for (var idx = 0; idx < values.length; idx++) {
          // current record
          var project_status = values[idx].project_status;
          var proposed_amount = values[idx].proposed_amount;
          var proposed_amount_neg = values[idx].proposed_amount_neg;

          var pass_flag = values[idx].pass_flag;
          var pass_invest = values[idx].pass_invest;
          var pass_invest_neg = values[idx].pass_invest_neg;

          var invest_flag = values[idx].invest_flag;
          var real_pay = values[idx].real_pay;
          var real_pay_neg = values[idx].real_pay_neg;

          // PROPOSED
          /*
          if (proposed_amount && proposed_amount >= 0 ) {
            reducedVal.proposed_flag = 1;
            reducedVal.proposed_amount = proposed_amount;
          } else if (proposed_amount && proposed_amount < 0) {
            reducedVal.proposed_flag_neg = 1;
            reducedVal.proposed_amount_neg = proposed_amount;
          }*/
          if (proposed_amount && proposed_amount < 0) {
            reducedVal.proposed_flag_neg = 1;
            //reducedVal.proposed_amount_neg = proposed_amount;
          } else {  // no value also regarded as proposed.
            reducedVal.proposed_flag = 1;
            //reducedVal.proposed_amount = proposed_amount;
          }

          // PASS
          if ( values[idx].meeting_type != "大额尽调审批" ) {
            if (project_status == 0) {  // fail
              reducedVal.pass_flag = 0;
              reducedVal.pass_flag_neg = 0;
              reducedVal.pass_invest = 0;
              reducedVal.pass_invest_neg = 0;
              phase_proposed_amount = proposed_amount;
              phase_pass_invest = pass_invest;
            } else if (pass_invest && pass_invest < 0 && project_status == 1) {
              reducedVal.pass_flag_neg = 1;
              phase_proposed_amount_neg = proposed_amount;
              phase_pass_invest_neg = pass_invest;
            } else if (project_status == 1) {
              reducedVal.pass_flag = 1;
              phase_proposed_amount = proposed_amount;
              phase_pass_invest = pass_invest;
            } else if (project_status == 2 && (reducedVal.pass_flag == -1 && reducedVal.pass_flag_neg == -1 )) {
              // progress and this project NEVER have passed result
              // if this meeeting is progress and this project have PASS or FAIL result, do not change amount, use the PASS or FAIL result
              phase_proposed_amount = proposed_amount;
              phase_pass_invest = pass_invest;
            }

          }

          // REAL INVEST
          if ((real_pay && real_pay > 0) || invest_flag == 1) {
            // if real_pay exist, accumulate proposed and pass amount
            reducedVal.invest_flag = 1;
            reducedVal.proposed_amount += phase_proposed_amount;
            reducedVal.pass_invest += phase_pass_invest;
            reducedVal.real_pay += real_pay;

            phase_proposed_amount = 0;
            phase_pass_invest = 0;
          } else if (real_pay && real_pay < 0) {
            // if real_pay exist, accumulate proposed and pass amount
            reducedVal.invest_flag_neg = 1;
            reducedVal.proposed_amount_neg += phase_proposed_amount_neg;
            reducedVal.pass_invest_neg += phase_pass_invest_neg;
            reducedVal.real_pay_neg += real_pay;

            phase_proposed_amount_neg = 0;
            phase_pass_invest_neg = 0;
          }


          // last row, and real_pay is null
          /*
          if (idx == values.length - 1 && !real_pay &&
              reducedVal.pass_flag == 0 && reducedVal.pass_flag_neg == 0) {
            reducedVal.proposed_amount += proposed_amount;
            reducedVal.pass_invest += pass_invest;
            reducedVal.proposed_amount_neg += proposed_amount_neg;
            reducedVal.pass_invest_neg += pass_invest_neg;
          }*/
          if (idx == values.length - 1 && !real_pay) {
            reducedVal.proposed_amount += phase_proposed_amount;
            reducedVal.pass_invest += phase_pass_invest;
            reducedVal.proposed_amount_neg += phase_proposed_amount_neg;
            reducedVal.pass_invest_neg += phase_pass_invest_neg;
            if (reducedVal.pass_flag == -1) { // ALL the time IN PROGRESS
              reducedVal.pass_flag = 0;
            }
            if (reducedVal.pass_flag_neg == -1) { // ALL the time IN PROGRESS
              reducedVal.pass_flag_neg = 0;
            }
          }


          //for (var i = 0 ; i < values[idx].groups.length; i++) {
          //  groupMaps[values[idx].groups[i]] = 1;
          //}
          if (values[idx].groups.length == 0) {
            groupSet.push("NAGroup");
          } else {
            for (var i = 0 ; i < values[idx].groups.length; i++) {
              var curGroup = values[idx].groups[i].group;
              var found = 0;
              for (var j = 0; j < groupSet.length; j++) {
                if (curGroup == groupSet[j]) {
                  found = 1;
                  break;
                }
              }
              if (!found) {
                groupSet.push(curGroup);
              }
            }
          }
        }

        // GroupMaps are MAP that = {key: value} key with groupName and value is one.

        //var groupKeys = Object.keys(groupMaps);
        //for (var groupIdx = 0; groupIdx < groupKeys.length; groupIdx++) {
        var groupSize = groupSet.length;
        //if (groupSet.length == 0) {
        //  groupSet.push("N/A");
        //}
        for (var groupIdx = 0; groupIdx < groupSize; groupIdx++) {
          var groupShare = {};
          groupShare.group = groupSet[groupIdx];
          //groupShare.group = groupKey;
          groupShare.proposed_share = reducedVal.proposed_amount / groupSize;
          groupShare.pass_share = reducedVal.pass_invest / groupSize;
          groupShare.invest_share = reducedVal.real_pay / groupSize;

          groupShare.proposed_count_share = reducedVal.proposed_flag / groupSize;
          groupShare.pass_count_share = reducedVal.pass_flag / groupSize;
          groupShare.invest_count_share = reducedVal.invest_flag / groupSize;

          groupShare.proposed_share_neg = reducedVal.proposed_amount_neg / groupSize;
          groupShare.pass_share_neg = reducedVal.pass_invest_neg / groupSize;
          groupShare.invest_share_neg = reducedVal.real_pay_neg / groupSize;
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
            meeting_type : {'$in': ["投资决策", "投后管理", "大额尽调审批"]}
          },
          verbose: true
        }
      );

      var reducedResults = DashBoard.find().fetch();

      /*
      for (var i = 0; i<reducedResults.length; i++ ){
        //if (i == 0){
        //  console.log(reducedResults[i]);
        //}
        //if (reducedResults[i].value.project_ID == "JTZL011500076") {
          console.log(reducedResults[i]);
          console.log(reducedResults[i].value.groups);
        //}
      }
      return {};
      */

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
          //if (groupName=="NAGroup")
          var groupName = groupReducedResult.group;
          if ( groupName ) {
            var groupCombineKey = groupName + "+" +
                                  reducedResults[i].value.project_type;
            var groupTotalKey = groupName + "+" + "ALL";

            var groupInstance = {
              proposed_share : groupReducedResult.proposed_share,
              pass_share : groupReducedResult.pass_share,
              invest_share : groupReducedResult.invest_share,
              proposed_count_share : groupReducedResult.proposed_count_share,
              pass_count_share : groupReducedResult.pass_count_share,
              invest_count_share : groupReducedResult.invest_count_share,
              proposed_share_neg : groupReducedResult.proposed_share_neg,
              pass_share_neg : groupReducedResult.pass_share_neg,
              invest_share_neg : groupReducedResult.invest_share_neg
            };
            if (groupResult[groupCombineKey]) {
              groupResult[groupCombineKey].proposed_share += groupInstance.proposed_share;
              groupResult[groupCombineKey].pass_share += groupInstance.pass_share;
              groupResult[groupCombineKey].invest_share += groupInstance.invest_share;

              groupResult[groupCombineKey].proposed_count_share += groupInstance.proposed_count_share;
              groupResult[groupCombineKey].pass_count_share += groupInstance.pass_count_share;
              groupResult[groupCombineKey].invest_count_share += groupInstance.invest_count_share;

              groupResult[groupCombineKey].proposed_share_neg += groupInstance.proposed_share_neg;
              groupResult[groupCombineKey].pass_share_neg += groupInstance.pass_share_neg;
              groupResult[groupCombineKey].invest_share_neg += groupInstance.invest_share_neg;
            } else {
              groupResult[groupCombineKey] = {};
              for (var key in groupInstance) {
                groupResult[groupCombineKey][key] = groupInstance[key];
              }
            }

            // FOR ALL !!
            if (groupResult[groupTotalKey]) {
              groupResult[groupTotalKey].proposed_share += groupInstance.proposed_share;
              groupResult[groupTotalKey].pass_share += groupInstance.pass_share;
              groupResult[groupTotalKey].invest_share += groupInstance.invest_share;

              groupResult[groupTotalKey].proposed_count_share += groupInstance.proposed_count_share;
              groupResult[groupTotalKey].pass_count_share += groupInstance.pass_count_share;
              groupResult[groupTotalKey].invest_count_share += groupInstance.invest_count_share;

              groupResult[groupTotalKey].proposed_share_neg += groupInstance.proposed_share_neg;
              groupResult[groupTotalKey].pass_share_neg += groupInstance.pass_share_neg;
              groupResult[groupTotalKey].invest_share_neg += groupInstance.invest_share_neg;
            } else {
              groupResult[groupTotalKey] = {}
              for (var key in groupInstance) {
                groupResult[groupTotalKey][key] = groupInstance[key];
              }
            }
          }
        } // for each group
      } // for each reduced result

      result.pass_target_ratio = result.pass_amount_total / 100000;
      result.invest_target_ratio = result.invest_amount_total / 100000;
      result.pass_meeting_ratio = result.pass_count / result.proposed_count;

      // result.group = groupResult;  -> save to Collection.Dashboard
      Collections.GroupDashBoard.remove({});
      var allGroupStats = {};
      for (var groupKey in groupResult) {
        //console.log(groupKey);
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
        if (projectTypeIdx == "ALL") {
          projectTypeName = "总计";
        }

        targetObject = {
          group: groupIdx,
          //project_type: projectTypeIdx,
          project_type: projectTypeName,
          proposed_share: Math.round(groupResult[groupKey].proposed_share * 100 ) / 100,
          pass_share: Math.round(groupResult[groupKey].pass_share * 100 ) / 100,
          invest_share: Math.round(groupResult[groupKey].invest_share * 100 ) / 100,
          proposed_count_share: Math.round(groupResult[groupKey].proposed_count_share * 100 ) / 100,
          pass_count_share: Math.round(groupResult[groupKey].pass_count_share * 100 ) / 100,
          invest_count_share: Math.round(groupResult[groupKey].invest_count_share * 100 ) / 100,
          proposed_share_neg: Math.round(groupResult[groupKey].proposed_share_neg * 100 ) / 100,
          pass_share_neg: Math.round(groupResult[groupKey].pass_share_neg * 100 ) / 100,
          invest_share_neg: Math.round(groupResult[groupKey].invest_share_neg * 100 ) / 100
        };

        var collectionFindKey = {
          "group": groupIdx,
          "project_type": projectTypeName
        };

        // Save to GroupDashboard for each group
        var searched = GroupDashBoard.find(collectionFindKey);
        if (searched.count() == 0) {
          GroupDashBoard.insert(targetObject);
        } else {
          GroupDashBoard.update(
            collectionFindKey,
            {upsert: false},
            {$set:targetObject }
          );
        }

        // For all groups
        if (allGroupStats[projectTypeName]) {
          allGroupStats[projectTypeName].proposed_share += groupResult[groupKey].proposed_share,
          allGroupStats[projectTypeName].pass_share += groupResult[groupKey].pass_share,
          allGroupStats[projectTypeName].invest_share += groupResult[groupKey].invest_share,
          allGroupStats[projectTypeName].proposed_count_share += groupResult[groupKey].proposed_count_share,
          allGroupStats[projectTypeName].pass_count_share += groupResult[groupKey].pass_count_share,
          allGroupStats[projectTypeName].invest_count_share += groupResult[groupKey].invest_count_share,
          allGroupStats[projectTypeName].proposed_share_neg += groupResult[groupKey].proposed_share_neg,
          allGroupStats[projectTypeName].pass_share_neg += groupResult[groupKey].pass_share_neg,
          allGroupStats[projectTypeName].invest_share_neg += groupResult[groupKey].invest_share_neg
        } else {
          allGroupStats[projectTypeName] = {
            group: "!所有团队",
            project_type: projectTypeName,
            proposed_share: groupResult[groupKey].proposed_share,
            pass_share: groupResult[groupKey].pass_share,
            invest_share: groupResult[groupKey].invest_share,
            proposed_count_share: groupResult[groupKey].proposed_count_share,
            pass_count_share: groupResult[groupKey].pass_count_share,
            invest_count_share: groupResult[groupKey].invest_count_share,
            proposed_share_neg: groupResult[groupKey].proposed_share_neg,
            pass_share_neg: groupResult[groupKey].pass_share_neg,
            invest_share_neg : groupResult[groupKey].invest_share_neg
          };
        }
      }

      //console.log(allGroupStats);
      // Save to GroupDashBoard for ALL Groups subtotal +  one 总计 projectType
      var allProjectType = [{label: "总计", value: "ALL"}];
      for (var i = 0; i < Meteor.myConstants.project_type.length; i++ ) {
        allProjectType.push(Meteor.myConstants.project_type[i]);
      }

      for (var typeIdx = 0 ; typeIdx < allProjectType.length; typeIdx++ ) {
        var projectTypeName = allProjectType[typeIdx].label;
        //console.log(projectTypeName);
        if (allGroupStats[projectTypeName]) {
          for(var key in allGroupStats[projectTypeName]) {
            if(allGroupStats[projectTypeName].hasOwnProperty(key)
               && key != "group" && key != "project_type") {
              allGroupStats[projectTypeName][key] =
                Math.round(allGroupStats[projectTypeName][key] * 100) / 100;
            }
          }
        } else {
          allGroupStats[projectTypeName]= {
            group: "!所有团队",
            project_type: projectTypeName,
            proposed_share: 0,
            pass_share: 0,
            invest_share: 0,
            proposed_count_share: 0,
            pass_count_share: 0,
            invest_count_share: 0,
            proposed_share_neg: 0,
            pass_share_neg: 0,
            invest_share_neg : 0
          };
        }

        //console.log(allGroupStats[projectTypeName]);
        var collectionFindKey = {
          "group": "!所有团队",
          "project_type": projectTypeName
        };
        var searched = GroupDashBoard.find(collectionFindKey);
        if (searched.count() == 0) {
          GroupDashBoard.insert(allGroupStats[projectTypeName]);
        } else {
          GroupDashBoard.update(
            collectionFindKey,
            {upsert: false},
            {$set:allGroupStats[projectTypeName] }
          );
        }
      }

      // Return result with ratio.
      return result;
    }
  });
