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
            if ( value && typeof value === 'string' ) {
              outputStr = value.replace(/(?:\r\n|\r|\n)/g, ' ');
              //half-width , => full-width ，
              outputStr = outputStr.replace(/(,)/g, '，');
              //if (selectCol[colIndex] == "meeting_result") {
              //  console.log(value);
              //  console.log(outputStr);
              //}
            }
            if (selectCol[colIndex] == "union_group") {  // array
              // array to string , with &
              //console.log(value);
              if (value && Array.isArray(value)) {
                //console.log(value);
                outputStr = value.join('&');
                //console.log(outputStr);
                arrValue = outputStr;
              }
            } else if(selectCol[colIndex] == "proposed_amount" ||
                      selectCol[colIndex] == "proposed_amount_CNY" ||
                      selectCol[colIndex] == "pass_invest" ||
                      selectCol[colIndex] == "pass_invest_CNY" ||
                      selectCol[colIndex] == "pre_money" ||
                      selectCol[colIndex] == "post_money" ||
                      selectCol[colIndex] == "real_pay" ||
                      selectCol[colIndex] == "real_pay_CNY") { // need number
              arrValue = outputStr;
            } else {
              //arrValue = '="' + outputStr + '"';
              arrValue = outputStr;
            }
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
  },

  CommaFormatted : function (amount) {
  	var delimiter = ","; // replace comma if desired
  	var a = amount.split('.',2)
  	var d = a[1];
  	var i = parseInt(a[0]);
  	if(isNaN(i)) { return ''; }
  	var minus = '';
  	if(i < 0) { minus = '-'; }
  	i = Math.abs(i);
  	var n = new String(i);
  	var a = [];
  	while(n.length > 3) {
  		var nn = n.substr(n.length-3);
  		a.unshift(nn);
  		n = n.substr(0,n.length-3);
  	}
  	if(n.length > 0) { a.unshift(n); }
  	n = a.join(delimiter);
  	if (d.length < 1) { amount = n; }
  	else { amount = n + '.' + d; }
  	amount = minus + amount;
  	return amount;
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
    {label: "中国人民币", value: "CNY", ratio: 1},
    {label: "美元", value: "USD", ratio: 6.5232},
    {label: "欧元", value: "EUR", ratio: 7.275},
    {label: "英镑", value: "GBP", ratio: 9.2115},
    {label: "港币", value: "HKD", ratio: 0.8408},
    {label: "日元", value: "JPY", ratio: 0.057476},
    {label: "澳大利亚元", value: "AUD", ratio: 4.8925},
    {label: "新西兰元", value: "NZD", ratio: 4.3542},
    {label: "加拿大元", value: "CAD", ratio: 4.9133},
    {label: "新加坡元", value: "SGD", ratio: 4.7498},
    {label: "以色列谢克尔", value: "ILS", ratio: 1.6993},
    {label: "朝鲜元", value: "KPW", ratio: 0.00556},
    {label: "韩国元", value: "KRW", ratio: 0.00556},
    {label: "澳门元", value: "MOP", ratio: 0.8158},
    {label: "新台币", value: "TWD", ratio: 0.1995},
    {label: "印度卢比", value: "INR", ratio: 0.09747},
    {label: "瑞士法郎", value: "CHF", ratio: 6.6661},
    {label: "丹麦克朗", value: "DKK", ratio: 0.975},
    {label: "挪威克朗", value: "NOK", ratio: 0.7658},
    {label: "瑞典克朗", value: "SEK", ratio: 0.7835},
    {label: "泰铢", value: "THB", ratio: 0.1843},
    {label: "阿联酋迪拉姆", value: "AED", ratio: 0.017713},
    {label: "印度尼西亚卢比", value: "IDR", ratio: 0.00049},
    {label: "马来西亚林吉特", value: "MYR", ratio: 0.016218},
    {label: "菲律宾比索", value: "PHP", ratio: 0.1401},
    {label: "俄罗斯卢布", value: "RUB", ratio: 0.0953},
    {label: "巴西雷亚尔", value: "BRL", ratio: 1.7667},
    {label: "南非兰特", value: "ZAR", ratio: 0.4212},
    {label: "===============", value: "SEP", ratio: 1},
    {label: "阿富汗尼", value: "AFN", ratio: 1},
    {label: "阿尔巴尼列克", value: "ALL", ratio: 1},
    {label: "亚美尼亚德拉姆", value: "AMD", ratio: 1},
    {label: "荷兰盾", value: "ANG", ratio: 1},
    {label: "安哥拉宽扎", value: "AOA", ratio: 1},
    {label: "阿根廷比索", value: "ARS", ratio: 1},
    {label: "阿鲁巴或荷兰盾", value: "AWG", ratio: 1},
    {label: "阿塞拜疆新马纳特", value: "AZN", ratio: 1},
    {label: "波斯尼亚可兑换马尔卡", value: "BAM", ratio: 1},
    {label: "巴巴多斯元", value: "BBD", ratio: 1},
    {label: "孟加拉国塔卡", value: "BDT", ratio: 1},
    {label: "保加利亚列弗", value: "BGN", ratio: 1},
    {label: "巴林第纳尔", value: "BHD", ratio: 1},
    {label: "布隆迪法郎", value: "BIF", ratio: 1},
    {label: "百慕大元", value: "BMD", ratio: 1},
    {label: "文莱元", value: "BND", ratio: 1},
    {label: "玻利维亚诺", value: "BOB", ratio: 1},
    {label: "巴哈马元", value: "BSD", ratio: 1},
    {label: "不丹努尔特鲁姆", value: "BTN", ratio: 1},
    {label: "博茨瓦纳普拉", value: "BWP", ratio: 1},
    {label: "白俄罗斯卢布", value: "BYR", ratio: 1},
    {label: "伯利兹元", value: "BZD", ratio: 1},
    {label: "刚果法郎", value: "CDF", ratio: 1},
    {label: "智利比索", value: "CLP", ratio: 1},
    {label: "哥伦比亚比索", value: "COP", ratio: 1},
    {label: "哥斯达黎加科朗", value: "CRC", ratio: 1},
    {label: "古巴可兑换比索", value: "CUC", ratio: 1},
    {label: "古巴比索", value: "CUP", ratio: 1},
    {label: "佛得角埃斯库多", value: "CVE", ratio: 1},
    {label: "捷克克朗", value: "CZK", ratio: 1},
    {label: "吉布提法郎", value: "DJF", ratio: 1},
    {label: "多米尼加比索", value: "DOP", ratio: 1},
    {label: "阿尔及利亚第纳尔", value: "DZD", ratio: 1},
    {label: "埃及镑", value: "EGP", ratio: 1},
    {label: "厄立特里亚纳克法", value: "ERN", ratio: 1},
    {label: "埃塞俄比亚比尔", value: "ETB", ratio: 1},
    {label: "斐济元", value: "FJD", ratio: 1},
    {label: "福克兰群岛镑", value: "FKP", ratio: 1},
    {label: "格鲁吉亚拉里", value: "GEL", ratio: 1},
    {label: "根西岛镑", value: "GGP", ratio: 1},
    {label: "加纳塞地", value: "GHS", ratio: 1},
    {label: "直布罗陀镑", value: "GIP", ratio: 1},
    {label: "冈比亚达拉西", value: "GMD", ratio: 1},
    {label: "几内亚法郎", value: "GNF", ratio: 1},
    {label: "危地马拉格查尔", value: "GTQ", ratio: 1},
    {label: "圭亚那元", value: "GYD", ratio: 1},
    {label: "洪都拉斯伦皮拉", value: "HNL", ratio: 1},
    {label: "克罗地亚库纳", value: "HRK", ratio: 1},
    {label: "海地古德", value: "HTG", ratio: 1},
    {label: "匈牙利福林", value: "HUF", ratio: 1},
    {label: "曼岛镑", value: "IMP", ratio: 1},
    {label: "伊拉克第纳尔", value: "IQD", ratio: 1},
    {label: "伊朗里亚尔", value: "IRR", ratio: 1},
    {label: "冰岛克朗", value: "ISK", ratio: 1},
    {label: "泽西岛镑", value: "JEP", ratio: 1},
    {label: "牙买加元", value: "JMD", ratio: 1},
    {label: "约旦第纳尔", value: "JOD", ratio: 1},
    {label: "肯尼亚先令", value: "KES", ratio: 1},
    {label: "吉尔吉斯斯坦索姆", value: "KGS", ratio: 1},
    {label: "柬埔寨瑞尔", value: "KHR", ratio: 1},
    {label: "科摩罗法郎", value: "KMF", ratio: 1},
    {label: "科威特第纳尔", value: "KWD", ratio: 1},
    {label: "开曼元", value: "KYD", ratio: 1},
    {label: "哈萨克斯坦坚戈", value: "KZT", ratio: 1},
    {label: "老挝基普", value: "LAK", ratio: 1},
    {label: "黎巴嫩镑", value: "LBP", ratio: 1},
    {label: "斯里兰卡卢比", value: "LKR", ratio: 1},
    {label: "利比里亚元", value: "LRD", ratio: 1},
    {label: "巴索托洛蒂", value: "LSL", ratio: 1},
    {label: "利比亚第纳尔", value: "LYD", ratio: 1},
    {label: "摩洛哥迪拉姆", value: "MAD", ratio: 1},
    {label: "摩尔多瓦列伊", value: "MDL", ratio: 1},
    {label: "马尔加什阿里亚", value: "MGA", ratio: 1},
    {label: "马其顿第纳尔", value: "MKD", ratio: 1},
    {label: "缅元", value: "MMK", ratio: 1},
    {label: "蒙古图格里克", value: "MNT", ratio: 1},
    {label: "毛里塔尼亚乌吉亚", value: "MRO", ratio: 1},
    {label: "毛里塔尼亚卢比", value: "MUR", ratio: 1},
    {label: "马尔代夫拉菲亚", value: "MVR", ratio: 1},
    {label: "马拉维克瓦查", value: "MWK", ratio: 1},
    {label: "墨西哥比索", value: "MXN", ratio: 1},
    {label: "莫桑比克梅蒂卡尔", value: "MZN", ratio: 1},
    {label: "纳米比亚元", value: "NAD", ratio: 1},
    {label: "尼日利亚奈拉", value: "NGN", ratio: 1},
    {label: "尼加拉瓜科多巴", value: "NIO", ratio: 1},
    {label: "尼泊尔卢比", value: "NPR", ratio: 1},
    {label: "阿曼里亚尔", value: "OMR", ratio: 1},
    {label: "巴拿马巴波亚", value: "PAB", ratio: 1},
    {label: "秘鲁索尔", value: "PEN", ratio: 1},
    {label: "巴布亚新几内亚基那", value: "PGK", ratio: 1},
    {label: "巴基斯坦卢比", value: "PKR", ratio: 1},
    {label: "波兰兹罗提", value: "PLN", ratio: 1},
    {label: "巴拉圭瓜拉尼", value: "PYG", ratio: 1},
    {label: "卡塔尔里亚尔", value: "QAR", ratio: 1},
    {label: "罗马尼亚新列伊", value: "RON", ratio: 1},
    {label: "塞尔维亚第纳尔", value: "RSD", ratio: 1},
    {label: "卢旺达法郎", value: "RWF", ratio: 1},
    {label: "沙特里亚尔", value: "SAR", ratio: 1},
    {label: "所罗门群岛元", value: "SBD", ratio: 1},
    {label: "塞舌尔卢比", value: "SCR", ratio: 1},
    {label: "苏丹镑", value: "SDG", ratio: 1},
    {label: "圣赫勒拿镑", value: "SHP", ratio: 1},
    {label: "塞拉利昂利昂", value: "SLL", ratio: 1},
    {label: "索马里先令", value: "SOS", ratio: 1},
    {label: "塞波加大公国 Luigino", value: "SPL", ratio: 1},
    {label: "苏里南元", value: "SRD", ratio: 1},
    {label: "圣多美多布拉", value: "STD", ratio: 1},
    {label: "萨尔瓦多科朗", value: "SVC", ratio: 1},
    {label: "叙利亚镑", value: "SYP", ratio: 1},
    {label: "斯威士兰里兰吉尼", value: "SZL", ratio: 1},
    {label: "塔吉克斯坦索莫尼", value: "TJS", ratio: 1},
    {label: "土库曼斯坦马纳特", value: "TMT", ratio: 1},
    {label: "突尼斯第纳尔", value: "TND", ratio: 1},
    {label: "汤加潘加", value: "TOP", ratio: 1},
    {label: "土耳其里拉", value: "TRY", ratio: 1},
    {label: "特立尼达元", value: "TTD", ratio: 1},
    {label: "图瓦卢元", value: "TVD", ratio: 1},
    {label: "坦桑尼亚先令", value: "TZS", ratio: 1},
    {label: "乌克兰格里夫纳", value: "UAH", ratio: 1},
    {label: "乌干达先令", value: "UGX", ratio: 1},
    {label: "乌拉圭比索", value: "UYU", ratio: 1},
    {label: "乌兹别克斯坦索姆", value: "UZS", ratio: 1},
    {label: "委内瑞拉玻利瓦尔", value: "VEF", ratio: 1},
    {label: "越南盾", value: "VND", ratio: 1},
    {label: "瓦努阿图瓦图", value: "VUV", ratio: 1},
    {label: "萨摩亚塔拉", value: "WST", ratio: 1},
    {label: "中非金融合作法郎", value: "XAF", ratio: 1},
    {label: "银（盎司）", value: "XAG", ratio: 1},
    {label: "金（盎司）", value: "XAU", ratio: 1},
    {label: "Bitcoin", value: "XBT", ratio: 1},
    {label: "东加勒比元", value: "XCD", ratio: 1},
    {label: "国际货币基金组织特别提款权", value: "XDR", ratio: 1},
    {label: "CFA 法郎", value: "XOF", ratio: 1},
    {label: "钯（盎司）", value: "XPD", ratio: 1},
    {label: "CFP 法郎", value: "XPF", ratio: 1},
    {label: "铂（盎司）", value: "XPT", ratio: 1},
    {label: "也门里亚尔", value: "YER", ratio: 1},
    {label: "赞比亚克瓦查", value: "ZMW", ratio: 1},
    {label: "津巴布韦元", value: "ZWD", ratio: 1}
  ],
  group_info: [
    {label: "CMF", value: "CMF", budget: 100000},
    {label: "保险集团", value: "保险集团", budget: 100000},
    {label: "财富管理集团", value: "财富管理集团", budget: 100000},
    {label: "创投", value: "创投", budget: 100000},
    {label: "德邦证券", value: "德邦证券", budget: 100000},
    {label: "地控", value: "地控", budget: 100000},
    {label: "鼎睿再保险", value: "鼎睿再保险", budget: 100000},
    {label: "二级市场投资部", value: "二级市场投资部", budget: 100000},
    {label: "二级市场投资部（海外）", value: "二级市场投资部（海外）", budget: 100000},
    {label: "复星创富", value: "复星创富", budget: 100000},
    {label: "复星创投", value: "复星创投", budget: 100000},
    {label: "复星矿业资源集团", value: "复星矿业资源集团", budget: 100000},
    {label: "复星昆仲资本", value: "复星昆仲资本", budget: 100000},
    {label: "复星欧亚资本", value: "复星欧亚资本", budget: 100000},
    {label: "复星医药", value: "复星医药", budget: 100000},
    {label: "钢铁及智能装备集团", value: "钢铁及智能装备集团", budget: 100000},
    {label: "公用设施投资部", value: "公用设施投资部", budget: 100000},
    {label: "固定收益投资部", value: "固定收益投资部", budget: 100000},
    {label: "国际发展部", value: "国际发展部", budget: 100000},
    {label: "海外保险投资部", value: "海外保险投资部", budget: 100000},
    {label: "互联网投资集团", value: "互联网投资集团", budget: 100000},
    {label: "健康控股", value: "健康控股", budget: 100000},
    {label: "金融创新投资部", value: "金融创新投资部", budget: 100000},
    {label: "矿业资源集团", value: "矿业资源集团", budget: 100000},
    {label: "昆仲资本", value: "昆仲资本", budget: 100000},
    {label: "伦敦团队", value: "伦敦团队", budget: 100000},
    {label: "旅游及商业集团", value: "旅游及商业集团", budget: 100000},
    {label: "能源集团", value: "能源集团", budget: 100000},
    {label: "企业发展部", value: "企业发展部", budget: 100000},
    {label: "日本投资部", value: "日本投资部", budget: 100000},
    {label: "融资租赁发展部", value: "融资租赁发展部", budget: 100000},
    {label: "石油与天然气事业部", value: "石油与天然气事业部", budget: 100000},
    {label: "食品饮料事业部", value: "食品饮料事业部", budget: 100000},
    {label: "私人银行事业部", value: "私人银行事业部", budget: 100000},
    {label: "天使投资部", value: "天使投资部", budget: 100000},
    {label: "银行集团", value: "银行集团", budget: 100000},
    {label: "印度投资部", value: "印度投资部", budget: 100000},
    {label: "影视娱乐事业部", value: "影视娱乐事业部", budget: 100000},
    {label: "永安保险", value: "永安保险", budget: 100000},
    {label: "重大项目投资发展部", value: "重大项目投资发展部", budget: 100000},
    {label: "资产配置部", value: "资产配置部", budget: 100000},
    {label: "东南亚投资部", value: "东南亚投资部", budget: 100000},
    {label: "EURAsia", value: "EURAsia", budget: 100000},
    {label: "复星瑞哲", value: "复星瑞哲", budget: 100000},
    {label: "时尚集团", value: "时尚集团", budget: 100000},
    {label: "文化投资部", value: "文化投资部", budget: 100000},
    {label: "伊比利亚投资部", value: "伊比利亚投资部", budget: 100000},
    {label: "珠宝时尚", value: "珠宝时尚", budget: 100000},
    {label: "Resolution", value: "Resolution", budget: 100000},
    {label: "复星医药", value: "复星医药", budget: 100000},
    {label: "南钢股份", value: "南钢股份", budget: 100000},
    {label: "海南矿业", value: "海南矿业", budget: 100000},
    {label: "ROC", value: "ROC", budget: 100000},
    {label: "豫园商城", value: "豫园商城", budget: 100000},
    {label: "复地集团", value: "复地集团", budget: 100000},
    {label: "星浩资本", value: "星浩资本", budget: 100000},
    {label: "BFC", value: "BFC", budget: 100000},
    {label: "Clubmed", value: "Clubmed", budget: 100000},
    {label: "亚特兰蒂斯", value: "亚特兰蒂斯", budget: 100000},
    {label: "永安保险", value: "永安保险", budget: 100000},
    {label: "复星保德信", value: "复星保德信", budget: 100000},
    {label: "鼎睿再保险", value: "鼎睿再保险", budget: 100000},
    {label: "Ironshore", value: "Ironshore", budget: 100000},
    {label: "葡萄牙保险", value: "葡萄牙保险", budget: 100000},
    {label: "MIG", value: "MIG", budget: 100000},
    {label: "德邦基金", value: "德邦基金", budget: 100000},
    {label: "德邦创新资本", value: "德邦创新资本", budget: 100000},
    {label: "中州期货", value: "中州期货", budget: 100000},
    {label: "恒利证券", value: "恒利证券", budget: 100000},
    {label: "H&A", value: "H&A", budget: 100000},
    {label: "杭州金投", value: "杭州金投", budget: 100000},
    {label: "创富租赁", value: "创富租赁", budget: 100000},
    {label: "广信小贷", value: "广信小贷", budget: 100000},
    {label: "星联保理", value: "星联保理", budget: 100000},
    {label: "星灵资产", value: "星灵资产", budget: 100000},
    {label: "量富征信", value: "量富征信", budget: 100000},
    {label: "上海钢联", value: "上海钢联", budget: 100000},
    {label: "复娱文化", value: "复娱文化", budget: 100000},
    {label: "财务公司", value: "财务公司", budget: 100000}
  ]
};
