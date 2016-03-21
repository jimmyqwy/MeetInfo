Meteor.myFunctions = {
  isMSIE: function () {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return true
    {
      return true;
    } else { // If another browser,
      return false;
    }
    return false;
  },

  MSIEVersion: function() {
    var iev = 0;
    var ieold = (/MSIE (\d+\.\d+);/.test(window.navigator.userAgent));
    var trident = !!window.navigator.userAgent.match(/Trident\/7.0/);
    var rv = window.navigator.userAgent.indexOf("rv:11.0");
    var ieEdge = /Edge\/12/.test(window.navigator.userAgent);

    if (ieold) {
      iev = Number(RegExp.$1);
    }
    if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
      iev = 10;
    }
    if (trident && rv !== -1) {
      iev = 11;
    }
    if (ieEdge) {
      iev = 12;
    }
    return iev;
  },

  JSONToCSVConvertor : function(fileName, JSONData, selectCol, CSVHead) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';

    // set head
    var row = "";
    for (var index = 0; index < CSVHead.length; index++) {
      row += CSVHead[index] + ',';
    }
    row = row.slice(0, -1);
    CSV += row + '\r\n';

    // set data body
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        var colCount = 0;
        /*
        for (var index in arrData[i]) {
          if (colCount != 0 ) {
            var arrValue = arrData[i][index] == null ? "" : '="' + arrData[i][index] + '"';
            row += arrValue + ',';
          }
          colCount ++;
        }*/
        for (var colIndex = 0 ; colIndex < selectCol.length; colIndex++ ) {
          var arrValue = "";
          if (arrData[i][selectCol[colIndex]] == null) {
            arrValue = "";
          } else {
            var value = arrData[i][selectCol[colIndex]];
            var outputStr = value;
            if ( typeof value === 'string' ) {
              outputStr = arrData[i][selectCol[colIndex]].replace(/(?:\r\n|\r|\n)/g, ' ');
              //half-width , => full-width ，
              outputStr = arrData[i][selectCol[colIndex]].replace(',', '，');
            }
            arrValue = '="' + outputStr + '"';
          }
          row += arrValue + ',';
        }
        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
    }
    if (CSV == '') {
        growl.error("Invalid data");
        return;
    }

    // Save file
    var ExportCSV = encodeURIComponent(CSV);
    var fileName = fileName ? fileName : "meetings_export";
    var IEVersion = Meteor.myFunctions.MSIEVersion();
    if(Meteor.myFunctions.isMSIE() && IEVersion < 10) {
      //console.log("test");
      var IEwindow = window.open();
      //IEwindow.document.write("\uFEFF" + 'sep=,\r\n' + CSV);
      //IEwindow.document.write('\uFEFFsep=,\r\n' + CSV);
      IEwindow.document.write('\uFEFF' + CSV);
      IEwindow.document.close();
      IEwindow.document.execCommand('SaveAs', true, fileName + ".csv");
      IEwindow.close();
    } else if (IEVersion === 10 || IEVersion === 11 || IEVersion === 12) {
      var BOM = "\uFEFF";
      var csvData = new Blob([BOM + CSV], { type: 'text/csv' });
      window.navigator.msSaveBlob(csvData, fileName + ".csv");
    } else {
      // Other browser
      //var uri = 'data:application/csv;charset=utf-8,' + escape(CSV);
      //var csv = json2csv(Meetings.find().fetch(), true, true);
      var uri = "data:application/csv;charset=utf-8,\uFEFF" + encodeURIComponent(CSV);
      var link = document.createElement("a");
      link.href = uri;
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

Meteor.myConstants = {
  selectedFields : [
    "projectID",
    "meeting_type",
    "meeting_group",
    "meeting_system",
    "meeting_organizer",
    "meeting_title",
    "meeting_date",
    "meeting_result",
    "meeting_pass",
    "meeting_comment",
    "project_type",
    "system_status",
    "group",
    "group_product",
    "union_group",
    "consult_group",
    "group_cnt",
    "project_name",
    "target_company",
    "place",
    "industry",
    "strategy_label",
    "manage_plat",
    "project_manager",
    "currency",
    "proposed_condition",
    "proposed_amount",
    "proposed_amount_CNY",
    "pass_date",
    "pass_condition",
    "pass_invest",
    "pass_invest_CNY",
    "proposed_invest_plat",
    "pre_money",
    "post_money",
    "post_deal_share",
    "contract_or_not",
    "contract_date",
    "invest_or_not",
    "invest_date",
    "invest_plat",
    "real_pay",
    "real_pay_CNY",
    "note_bond"
  ],
  project_type: [
    {label: "一级股权", value: "equity"},
    {label: "二级股票", value: "stock"},
    {label: "二级债券", value: "bond"},
    {label: "地产", value: "estate"},
    {label: "基金设立", value: "fund"},
    {label: "影视", value: "movie"},
    {label: "其他", value: "other"}
  ],
  currency: [
    {label: "中国人民币", value: "CNY"},
    {label: "美元", value: "USD"},
    {label: "欧元", value: "EUR"},
    {label: "英镑", value: "GBP"},
    {label: "港币", value: "HKD"},
    {label: "日元", value: "JPY"},
    {label: "澳大利亚元", value: "AUD"},
    {label: "新西兰元", value: "NZD"},
    {label: "加拿大元", value: "CAD"},
    {label: "新加坡元", value: "SGD"},
    {label: "以色列谢克尔", value: "ILS"},
    {label: "朝鲜元", value: "KPW"},
    {label: "韩国元", value: "KRW"},
    {label: "澳门元", value: "MOP"},
    {label: "新台币", value: "TWD"},
    {label: "印度卢比", value: "INR"},
    {label: "瑞士法郎", value: "CHF"},
    {label: "丹麦克朗", value: "DKK"},
    {label: "挪威克朗", value: "NOK"},
    {label: "瑞典克朗", value: "SEK"},
    {label: "泰铢", value: "THB"},
    {label: "阿联酋迪拉姆", value: "AED"},
    {label: "印度尼西亚卢比", value: "IDR"},
    {label: "马来西亚林吉特", value: "MYR"},
    {label: "菲律宾比索", value: "PHP"},
    {label: "俄罗斯卢布", value: "RUB"},
    {label: "巴西雷亚尔", value: "BRL"},
    {label: "南非兰特", value: "ZAR"},
    {label: "===============", value: "SEP"},
    {label: "阿富汗尼", value: "AFN"},
    {label: "阿尔巴尼列克", value: "ALL"},
    {label: "亚美尼亚德拉姆", value: "AMD"},
    {label: "荷兰盾", value: "ANG"},
    {label: "安哥拉宽扎", value: "AOA"},
    {label: "阿根廷比索", value: "ARS"},
    {label: "阿鲁巴或荷兰盾", value: "AWG"},
    {label: "阿塞拜疆新马纳特", value: "AZN"},
    {label: "波斯尼亚可兑换马尔卡", value: "BAM"},
    {label: "巴巴多斯元", value: "BBD"},
    {label: "孟加拉国塔卡", value: "BDT"},
    {label: "保加利亚列弗", value: "BGN"},
    {label: "巴林第纳尔", value: "BHD"},
    {label: "布隆迪法郎", value: "BIF"},
    {label: "百慕大元", value: "BMD"},
    {label: "文莱元", value: "BND"},
    {label: "玻利维亚诺", value: "BOB"},
    {label: "巴哈马元", value: "BSD"},
    {label: "不丹努尔特鲁姆", value: "BTN"},
    {label: "博茨瓦纳普拉", value: "BWP"},
    {label: "白俄罗斯卢布", value: "BYR"},
    {label: "伯利兹元", value: "BZD"},
    {label: "刚果法郎", value: "CDF"},
    {label: "智利比索", value: "CLP"},
    {label: "哥伦比亚比索", value: "COP"},
    {label: "哥斯达黎加科朗", value: "CRC"},
    {label: "古巴可兑换比索", value: "CUC"},
    {label: "古巴比索", value: "CUP"},
    {label: "佛得角埃斯库多", value: "CVE"},
    {label: "捷克克朗", value: "CZK"},
    {label: "吉布提法郎", value: "DJF"},
    {label: "多米尼加比索", value: "DOP"},
    {label: "阿尔及利亚第纳尔", value: "DZD"},
    {label: "埃及镑", value: "EGP"},
    {label: "厄立特里亚纳克法", value: "ERN"},
    {label: "埃塞俄比亚比尔", value: "ETB"},
    {label: "斐济元", value: "FJD"},
    {label: "福克兰群岛镑", value: "FKP"},
    {label: "格鲁吉亚拉里", value: "GEL"},
    {label: "根西岛镑", value: "GGP"},
    {label: "加纳塞地", value: "GHS"},
    {label: "直布罗陀镑", value: "GIP"},
    {label: "冈比亚达拉西", value: "GMD"},
    {label: "几内亚法郎", value: "GNF"},
    {label: "危地马拉格查尔", value: "GTQ"},
    {label: "圭亚那元", value: "GYD"},
    {label: "洪都拉斯伦皮拉", value: "HNL"},
    {label: "克罗地亚库纳", value: "HRK"},
    {label: "海地古德", value: "HTG"},
    {label: "匈牙利福林", value: "HUF"},
    {label: "曼岛镑", value: "IMP"},
    {label: "伊拉克第纳尔", value: "IQD"},
    {label: "伊朗里亚尔", value: "IRR"},
    {label: "冰岛克朗", value: "ISK"},
    {label: "泽西岛镑", value: "JEP"},
    {label: "牙买加元", value: "JMD"},
    {label: "约旦第纳尔", value: "JOD"},
    {label: "肯尼亚先令", value: "KES"},
    {label: "吉尔吉斯斯坦索姆", value: "KGS"},
    {label: "柬埔寨瑞尔", value: "KHR"},
    {label: "科摩罗法郎", value: "KMF"},
    {label: "科威特第纳尔", value: "KWD"},
    {label: "开曼元", value: "KYD"},
    {label: "哈萨克斯坦坚戈", value: "KZT"},
    {label: "老挝基普", value: "LAK"},
    {label: "黎巴嫩镑", value: "LBP"},
    {label: "斯里兰卡卢比", value: "LKR"},
    {label: "利比里亚元", value: "LRD"},
    {label: "巴索托洛蒂", value: "LSL"},
    {label: "利比亚第纳尔", value: "LYD"},
    {label: "摩洛哥迪拉姆", value: "MAD"},
    {label: "摩尔多瓦列伊", value: "MDL"},
    {label: "马尔加什阿里亚", value: "MGA"},
    {label: "马其顿第纳尔", value: "MKD"},
    {label: "缅元", value: "MMK"},
    {label: "蒙古图格里克", value: "MNT"},
    {label: "毛里塔尼亚乌吉亚", value: "MRO"},
    {label: "毛里塔尼亚卢比", value: "MUR"},
    {label: "马尔代夫拉菲亚", value: "MVR"},
    {label: "马拉维克瓦查", value: "MWK"},
    {label: "墨西哥比索", value: "MXN"},
    {label: "莫桑比克梅蒂卡尔", value: "MZN"},
    {label: "纳米比亚元", value: "NAD"},
    {label: "尼日利亚奈拉", value: "NGN"},
    {label: "尼加拉瓜科多巴", value: "NIO"},
    {label: "尼泊尔卢比", value: "NPR"},
    {label: "阿曼里亚尔", value: "OMR"},
    {label: "巴拿马巴波亚", value: "PAB"},
    {label: "秘鲁索尔", value: "PEN"},
    {label: "巴布亚新几内亚基那", value: "PGK"},
    {label: "巴基斯坦卢比", value: "PKR"},
    {label: "波兰兹罗提", value: "PLN"},
    {label: "巴拉圭瓜拉尼", value: "PYG"},
    {label: "卡塔尔里亚尔", value: "QAR"},
    {label: "罗马尼亚新列伊", value: "RON"},
    {label: "塞尔维亚第纳尔", value: "RSD"},
    {label: "卢旺达法郎", value: "RWF"},
    {label: "沙特里亚尔", value: "SAR"},
    {label: "所罗门群岛元", value: "SBD"},
    {label: "塞舌尔卢比", value: "SCR"},
    {label: "苏丹镑", value: "SDG"},
    {label: "圣赫勒拿镑", value: "SHP"},
    {label: "塞拉利昂利昂", value: "SLL"},
    {label: "索马里先令", value: "SOS"},
    {label: "塞波加大公国 Luigino", value: "SPL"},
    {label: "苏里南元", value: "SRD"},
    {label: "圣多美多布拉", value: "STD"},
    {label: "萨尔瓦多科朗", value: "SVC"},
    {label: "叙利亚镑", value: "SYP"},
    {label: "斯威士兰里兰吉尼", value: "SZL"},
    {label: "塔吉克斯坦索莫尼", value: "TJS"},
    {label: "土库曼斯坦马纳特", value: "TMT"},
    {label: "突尼斯第纳尔", value: "TND"},
    {label: "汤加潘加", value: "TOP"},
    {label: "土耳其里拉", value: "TRY"},
    {label: "特立尼达元", value: "TTD"},
    {label: "图瓦卢元", value: "TVD"},
    {label: "坦桑尼亚先令", value: "TZS"},
    {label: "乌克兰格里夫纳", value: "UAH"},
    {label: "乌干达先令", value: "UGX"},
    {label: "乌拉圭比索", value: "UYU"},
    {label: "乌兹别克斯坦索姆", value: "UZS"},
    {label: "委内瑞拉玻利瓦尔", value: "VEF"},
    {label: "越南盾", value: "VND"},
    {label: "瓦努阿图瓦图", value: "VUV"},
    {label: "萨摩亚塔拉", value: "WST"},
    {label: "中非金融合作法郎", value: "XAF"},
    {label: "银（盎司）", value: "XAG"},
    {label: "金（盎司）", value: "XAU"},
    {label: "Bitcoin", value: "XBT"},
    {label: "东加勒比元", value: "XCD"},
    {label: "国际货币基金组织特别提款权", value: "XDR"},
    {label: "CFA 法郎", value: "XOF"},
    {label: "钯（盎司）", value: "XPD"},
    {label: "CFP 法郎", value: "XPF"},
    {label: "铂（盎司）", value: "XPT"},
    {label: "也门里亚尔", value: "YER"},
    {label: "赞比亚克瓦查", value: "ZMW"},
    {label: "津巴布韦元", value: "ZWD"},
  ]
};
