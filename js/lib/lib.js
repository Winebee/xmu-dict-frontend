window.XMUDict = window.XMUDict || {};
XMUDict.lib = {};

XMUDict.lib.toXMLObject = function(XMLStr) {
  if(typeof XMLStr != 'string') {
    console.error(new TypeError('Invalid type of `XMLStr` ' + typeof XMLStr));
    return;
  }
  var container = document.createElement('div'); // Memory leak?
  container.innerHTML = XMLStr.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  setTimeout(function() {
    container = null;
  }, 0);
  return container.firstElementChild;
};

XMUDict.lib.XMLToJson = function(XML) { // Lambda expressions don't have `this`
  var obj = {};
  if(XML.childElementCount == 0) {
    if(XML.childNodes[0] && XML.childNodes[0].nodeName == '#text') {
      return XML.childNodes[0].textContent;
    }
  }
  for(var property of XML.childNodes) {
    obj[property.nodeName.toLowerCase()] = this.XMLToJson(property);
  }
  return obj;
};

// Weather area
XMUDict.lib.getWeather = function() {
  var _this = this;
  // http://wthrcdn.etouch.cn/WeatherApi?city=厦门
  $.get('http://wthrcdn.etouch.cn/weather_mini?city=厦门', function(data) {
    // _this.weather = _this.XMLToJson(_this.toXMLObject(data));
    _this.weather = JSON.parse(data);
    // $('#widget-weather').html(`${_this.weather.wendu}℃ 雨伞指数：${_this.weather.zhishus.zhishu.value}`);
    $('#widget-weather').html(`${_this.weather.data.wendu}℃ ${_this.weather.data.forecast[0].type}`);
  });
};

// GPA area
XMUDict.lib.calcGPA = function(gradeStr) {
  let gpa;
  let grade;
  if (!(grade = parseInt(gradeStr))) { // A, B, ...
    let gpa_table = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D': 1.0,
      'F': 0
    };
    gpa = gradeStr in gpa_table ? gpa_table[gradeStr] : 0;
  } else {
    if (grade < 74.5) { // 0~74
      if (grade < 67.5) { // 0~67
        if (grade < 63.5) { // 0~63
          if (grade < 60) { // 0~59
            gpa = 0
          } else { // 60~63
            gpa = 1.0;
          }
        } else { // 64~67
          gpa = 1.7;
        }
      } else if (grade < 71.5) { // 68~71
        gpa = 2.0;
      } else { // 72~74
        gpa = 2.3;
      }
    } else if (grade < 84.5) { // 75~84
      if (grade < 80.5) { // 75~80
        if (grade < 77.5) { // 75~77
          gpa = 2.7;
        } else { // 78~80
          gpa = 3.0;
        }
      } else { // 81~84
        gpa = 3.3;
      }
    } else if (grade < 89.5) { // 85~89
      gpa = 3.7;
    } else { // 90~
      gpa = 4.0;
    }
  }
  return gpa;
}

XMUDict.lib.getGPA = function() {
  var calcGPA = XMUDict.lib.calcGPA;
  var totalGPASum = 0
  var totalCreditSum = 0;
  for (let term of XMUDict.grade) {
    let termGPASum = 0;
    let termCreditSum = 0;
    for (let subject of term.subjects) {
      let grade;
      // Filters
      if (subject.takingType == '选修' && subject.courseType != '学科或专业方向性课') continue;
      if (subject.grade.includes('合格')) continue;
      if (subject.grade == '') continue;

      termGPASum += (subject.GPA = calcGPA(subject.grade)) * parseFloat(subject.credit);
      termCreditSum += parseFloat(subject.credit);
      // End processing a subject
    }
    term.GPA = (termCreditSum == 0 ? 0 : termGPASum / termCreditSum);
    // End traversing subjects
    totalGPASum += termGPASum;
    totalCreditSum += termCreditSum;
    // End processing a term
  }
  XMUDict.grade.push(totalCreditSum == 0 ? 0 : totalGPASum / totalCreditSum);
  // End traversing terms
}