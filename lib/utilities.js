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

  JSONToCSVConvertor : function(fileName, JSONData, CSVHead) {
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
        for (var index in arrData[i]) {
          if (colCount != 0 ) {
            var arrValue = arrData[i][index] == null ? "" : '="' + arrData[i][index] + '"';
            row += arrValue + ',';
          }
          colCount ++;
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
      window.navigator.msSaveBlob(csvData, filename + ".csv");
    } else {
      // Other browser
      //var uri = 'data:application/csv;charset=utf-8,' + escape(CSV);
      var uri = 'data:application/csv;charset=utf-8,\uFEFF' + ExportCSV;
      var link = document.createElement("a");
      link.href = uri;
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

}
