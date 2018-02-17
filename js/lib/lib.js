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

XMUDict.lib.getGPA = function(usersFilter) {
  var calcGPA = XMUDict.lib.calcGPA;
  var totalGPASum = 0
  var totalCreditSum = 0;
  XMUDict.grade.forEach(function(term, termIndex) {
    if(typeof term != 'object') return;
    let termGPASum = 0;
    let termCreditSum = 0;
    term.subjects.forEach(function(subject, subjectIndex) {
      // Filters
      if(subject.takingType == '选修' && subject.courseType != '学科或专业方向性课') return;
      if(subject.grade.includes('合格')) return;
      if(subject.grade == '') return;
      if(usersFilter && !$(`#grade_${termIndex}_${subjectIndex}`).prop('checked')) return;

      termGPASum += (subject.GPA = calcGPA(subject.grade)) * parseFloat(subject.credit);
      termCreditSum += parseFloat(subject.credit);
      // End processing a subject
    });
    term.GPA = (termCreditSum == 0 ? 0 : termGPASum / termCreditSum);
    // End traversing subjects
    totalGPASum += termGPASum;
    totalCreditSum += termCreditSum;
    // End processing a term
  });
  XMUDict.grade.GPA = totalCreditSum == 0 ? 0 : totalGPASum / totalCreditSum;
  // End traversing terms
}

XMUDict.lib.ELEC_MAP = {
  "本部芙蓉区": {
    "value": "01",
    "buildings": {
      "芙蓉11": "芙蓉11",
      "芙蓉12": "芙蓉12",
      "芙蓉八": "芙蓉八",
      "芙蓉二": "芙蓉二",
      "芙蓉九": "芙蓉九",
      "芙蓉六": "芙蓉六",
      "芙蓉七": "芙蓉七",
      "芙蓉三": "芙蓉三",
      "芙蓉十": "芙蓉十",
      "芙蓉十三": "芙蓉十三",
      "芙蓉四": "芙蓉四",
      "芙蓉五": "芙蓉五",
      "芙蓉一": "芙蓉一"
    }
  },
  "本部石井区": {
    "value": "02",
    "buildings": {
      "石井1": "石井1",
      "石井2": "石井2",
      "石井3": "石井3",
      "石井4": "石井4",
      "石井5": "石井5",
      "石井6": "石井6",
      "石井7": "石井7"
    }
  },
  "本部南光区": {
    "value": "03",
    "buildings": {
      "南光7": "南光7",
      "南光四": "南光四",
      "综合楼": "综合楼"
    }
  },
  "本部凌云区": {
    "value": "04",
    "buildings": {
      "东村": "东村",
      "凌云10": "凌云10",
      "凌云1号公寓": "凌云1号公寓",
      "凌云2号公寓": "凌云2号公寓",
      "凌云3号公寓": "凌云3号公寓",
      "凌云6号公寓": "凌云6号公寓",
      "凌云7": "凌云7",
      "凌云8": "凌云8",
      "凌云9": "凌云9",
      "凌云四": "凌云四",
      "凌云五": "凌云五"
    }
  },
  "本部勤业区": {
    "value": "05",
    "buildings": {
      "勤业6号公寓": "勤业6号公寓",
      "勤业7号公寓": "勤业7号公寓",
      "勤业四": "勤业四"
    }
  },
  "本部海滨新区": {
    "value": "06",
    "buildings": {
      "新区二": "新区二",
      "新区三": "新区三",
      "新区一": "新区一"
    }
  },
  "本部丰庭区": {
    "value": "07",
    "buildings": {
      "笃行3": "笃行3",
      "丰庭1": "丰庭1",
      "丰庭2": "丰庭2",
      "丰庭3": "丰庭3",
      "丰庭4": "丰庭4",
      "丰庭5": "丰庭5"
    }
  },
  "漳州校区芙蓉园": {
    "value": "26",
    "buildings": {
      "芙蓉1": "芙蓉1",
      "芙蓉2": "芙蓉2",
      "芙蓉3": "芙蓉3",
      "芙蓉4": "芙蓉4",
      "芙蓉5": "芙蓉5"
    }
  },
  "海韵学生公寓": {
    "value": "08",
    "buildings": {
      "海韵09": "海韵09",
      "海韵10": "海韵10",
      "海韵11": "海韵11",
      "海韵12": "海韵12",
      "海韵13": "海韵13",
      "海韵14": "海韵14",
      "海韵15": "海韵15",
      "海韵16": "海韵16",
      "海韵17": "海韵17",
      "海韵18": "海韵18"
    }
  },
  "曾厝安学生公寓": {
    "value": "09",
    "buildings": {
      "1号楼": "1号楼",
      "2号楼": "2号楼",
      "3号楼": "3号楼",
      "4号楼": "4号楼",
      "5号楼": "5号楼",
      "6号楼": "6号楼",
      "7号楼": "7号楼",
      "8号楼": "8号楼"
    }
  },
  "漳州校区博学园": {
    "value": "21",
    "buildings": {
      "博学1": "博学1",
      "博学2": "博学2",
      "博学3": "博学3"
    }
  },
  "漳州校区囊萤园": {
    "value": "22",
    "buildings": {
      "囊萤1": "囊萤1",
      "囊萤2": "囊萤2",
      "囊萤3": "囊萤3"
    }
  },
  "漳州校区笃行园": {
    "value": "23",
    "buildings": {
      "笃行1": "笃行1",
      "笃行2": "笃行2"
    }
  },
  "漳州校区映雪园": {
    "value": "24",
    "buildings": {
      "映雪1": "映雪1",
      "映雪2": "映雪2",
      "映雪3": "映雪3"
    }
  },
  "漳州校区勤业园": {
    "value": "25",
    "buildings": {
      "勤业1": "勤业1",
      "勤业2": "勤业2",
      "勤业3": "勤业3",
      "勤业4": "勤业4",
      "勤业5": "勤业5",
      "勤业6": "勤业6",
      "勤业7": "勤业7"
    }
  },
  "漳州校区若谷园": {
    "value": "27",
    "buildings": {
      "若谷1": "若谷1"
    }
  },
  "漳州校区凌云园": {
    "value": "28",
    "buildings": {
      "凌云1": "凌云1",
      "凌云2": "凌云2",
      "凌云3": "凌云3"
    }
  },
  "漳州校区丰庭园": {
    "value": "29",
    "buildings": {
      "丰庭1": "丰庭1",
      "丰庭10": "丰庭10",
      "丰庭11": "丰庭11",
      "丰庭12": "丰庭12",
      "丰庭2": "丰庭2",
      "丰庭3": "丰庭3",
      "丰庭4": "丰庭4",
      "丰庭5": "丰庭5",
      "丰庭6": "丰庭6",
      "丰庭7": "丰庭7",
      "丰庭8": "丰庭8",
      "丰庭9": "丰庭9"
    }
  },
  "漳州校区南安园": {
    "value": "30",
    "buildings": {
      "南安1": "南安1",
      "南安2": "南安2",
      "南安3": "南安3",
      "南安4": "南安4",
      "南安5": "南安5",
      "南安6": "南安6",
      "南安7": "南安7"
    }
  },
  "漳州校区南光园": {
    "value": "31",
    "buildings": {
      "南光1": "南光1",
      "南光10": "南光10",
      "南光11": "南光11",
      "南光12": "南光12",
      "南光13": "南光13",
      "南光2": "南光2",
      "南光3": "南光3",
      "南光4": "南光4",
      "南光5": "南光5",
      "南光6": "南光6",
      "南光7": "南光7",
      "南光8": "南光8",
      "南光9": "南光9"
    }
  },
  "漳州校区嘉庚若谷园": {
    "value": "32",
    "buildings": {
      "若谷贰": "若谷贰",
      "若谷叁": "若谷叁"
    }
  },
  "翔安校区芙蓉区": {
    "value": "33",
    "buildings": {
      "翔安芙蓉1": "翔安芙蓉1",
      "翔安芙蓉10": "翔安芙蓉10",
      "翔安芙蓉2": "翔安芙蓉2",
      "翔安芙蓉3": "翔安芙蓉3",
      "翔安芙蓉4": "翔安芙蓉4",
      "翔安芙蓉5": "翔安芙蓉5",
      "翔安芙蓉6": "翔安芙蓉6",
      "翔安芙蓉7": "翔安芙蓉7",
      "翔安芙蓉8": "翔安芙蓉8",
      "翔安芙蓉9": "翔安芙蓉9"
    }
  },
  "翔安校区南安区": {
    "value": "34",
    "buildings": {
      "翔安南安10": "翔安南安10",
      "翔安南安11": "翔安南安11",
      "翔安南安12": "翔安南安12",
      "翔安南安13": "翔安南安13",
      "翔安南安2": "翔安南安2",
      "翔安南安3": "翔安南安3",
      "翔安南安4": "翔安南安4",
      "翔安南安5": "翔安南安5",
      "翔安南安6": "翔安南安6",
      "翔安南安7": "翔安南安7",
      "翔安南安8": "翔安南安8",
      "翔安南安9": "翔安南安9"
    }
  },
  "翔安校区南光区": {
    "value": "35",
    "buildings": {
      "翔安南光1": "翔安南光1",
      "翔安南光2": "翔安南光2",
      "翔安南光3": "翔安南光3",
      "翔安南光4": "翔安南光4",
      "翔安南光5": "翔安南光5",
      "翔安南光6": "翔安南光6",
      "翔安南光7": "翔安南光7",
      "翔安南光8": "翔安南光8"
    }
  },
  "翔安国光区": {
    "value": "42",
    "buildings": {
      "GG1": "GG1",
      "GG10": "GG10",
      "GG11": "GG11",
      "GG2": "GG2",
      "GG3": "GG3",
      "GG4": "GG4",
      "GG5": "GG5",
      "GG6": "GG6",
      "GG7": "GG7",
      "GG8": "GG8",
      "GG9": "GG9"
    }
  },
  "翔安丰庭区": {
    "value": "41",
    "buildings": {
      "FT1": "FT1",
      "FT2": "FT2",
      "FT3": "FT3",
      "FT4": "FT4"
    }
  },
  "翔安笃行区": {
    "value": "40",
    "buildings": {
      "DX1": "DX1",
      "DX10": "DX10",
      "DX2": "DX2",
      "DX3": "DX3",
      "DX4": "DX4",
      "DX5": "DX5",
      "DX6": "DX6",
      "DX7": "DX7",
      "DX8": "DX8",
      "DX9": "DX9"
    }
  },
  "思明校区留学生区": {
    "value": "10",
    "buildings": {}
  },
  "翔安三期H区": {
    "value": "11",
    "buildings": {}
  },
  "翔安三期K区": {
    "value": "12",
    "buildings": {}
  },
  "翔安校区博学区": {
    "value": "50",
    "buildings": {
      "博学1": "博学1",
      "博学10": "博学10",
      "博学11": "博学11",
      "博学2": "博学2",
      "博学3": "博学3",
      "博学4": "博学4",
      "博学5": "博学5",
      "博学6": "博学6",
      "博学7": "博学7",
      "博学8": "博学8",
      "博学9": "博学9"
    }
  },
  "翔安校区凌云区": {
    "value": "51",
    "buildings": {
      "凌云1": "凌云1",
      "凌云2": "凌云2",
      "凌云3": "凌云3",
      "凌云4": "凌云4",
      "凌云5": "凌云5",
      "凌云6": "凌云6",
      "凌云7": "凌云7"
    }
  },
  "翔安校区映雪区": {
    "value": "52",
    "buildings": {
      "映雪1": "映雪1",
      "映雪2": "映雪2",
      "映雪3": "映雪3",
      "映雪4": "映雪4",
      "映雪5": "映雪5",
      "映雪6": "映雪6"
    }
  }
};
