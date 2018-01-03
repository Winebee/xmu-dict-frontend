// Declarations

window.XMUDict = {};

XMUDict.user = new User();
XMUDict.Alert = Alert;
XMUDict.lib = {};

// gpa area
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

XMUDict.renderer = {
  grade: function(data) {
    XMUDict.grade = data;
    XMUDict.lib.getGPA();
    console.log(XMUDict.grade);
    var html;
    for(var term of XMUDict.grade) {
      if(typeof term == 'number') {
        $('#grade caption').html(`总绩点${term}`);
        break;
      }
      html += `
        <tr class="text-light bg-dark">
          <th colspan="8" scope="row">${term.name}</th>
        </tr>
      `;
      for(var subject of term.subjects) {
        html += `
          <tr>
            <th scope="row">${subject.name}</th>
            <td>${subject.credit}</td>
            <td>${subject.courseType}</td>
            <td>${subject.takingType}</td>
            <td>${subject.grade}</td>
            <td>${subject.specialReason}</td>
            <td>${subject.ranking}</td>
            <td>${subject.GPA || ''}</td>
          </tr>
        `;
      }
      html += `
        <tr>
          <th colspan="6" scope="row">学期绩点</th>
          <td colspan="2">${term.GPA}</td>
        </tr>
      `
    }
    $('#grade tbody').html(html);
    $('#main').fadeOut(700);
    setTimeout(function() {
      $('#grade').fadeIn(700);
    }, 400);
  },
  card: function(data) {
    console.log(data);
    var balance = parseFloat(data.balance);
    new XMUDict.Alert(`${balance >= 80 ? '土豪，' : ''}你的校园卡里${balance <= 20 ? '只' : '还'}剩${balance <= 20 ? '<span class="text-danger">' : '<span class="text-primary">'}${data.balance}</span>${balance <= 20 ? '啦' : ''}`, 'success', 5000);
  }
};

XMUDict.handlers = {
  error: function(xhr, info, err) {
    new XMUDict.Alert(info, 'dark', 5000);
  }
};

XMUDict.handlers = {
  grade: function() {
    $.ajax({
      url: '/grade/?username=' + XMUDict.user.username + '&password=' + XMUDict.user.password,
      type: 'GET',
      timeout: 5000,
      data: "",
      success: XMUDict.renderer.grade,
      error: XMUDict.handlers.error
    });
  },
  card: function() {
    $.ajax({
      url: '/card/?username=' + XMUDict.user.username + '&password=' + XMUDict.user.password,
      type: 'GET',
      timeout: 5000,
      data: "",
      success: XMUDict.renderer.card,
      error: XMUDict.handlers.error
    });
  },
  elec: function() {
    // $.ajax({
    //   url: '/elec/',
    //   type: 'GET',
    //   timeout: 5000,
    //   dataType: 'json',
    //   processData: false,
    //   contentType: "application/json; charset=utf-8",
    //   data: {
    //     username: XMUDict.user.username,
    //     password: XMUDict.user.password
    //   },
    //   success: XMUDict.renderer.card,
    //   error: XMUDict.handlers.error
    // });
    new XMUDict.Alert('学校网站炸啦', 'dark', 5000);
  },
  auth: function(next) {
    if(!!XMUDict.user.username && !!XMUDict.user.password && XMUDict.user.username != "" && XMUDict.user.password != "") {
      return next();
    } else {
      console.log('[ Auth ] Logging in.');
      $('#authModal').modal('show');
      $('#authModalStart').click(function() {
        XMUDict.user.username = $('#username').val();
        XMUDict.user.password = $('#password').val();
        XMUDict.handlers.auth(next);
        $('#authModal').modal('hide');
      });
    }
  },
};

XMUDict.functionList = {
  name: ['Grade', 'Card', 'Elec'],
  login: ['grade', 'card']
};

// Initialize

for(var i in XMUDict.functionList.name) {
  let funName = XMUDict.functionList.name[i].toLowerCase();
  console.log(funName);
  $('#button' + XMUDict.functionList.name[i]).click(function() {
    console.log(`[ ${funName} ] Handling.`);
    if(XMUDict.functionList.login.includes(funName)) {
      XMUDict.handlers.auth(XMUDict.handlers[funName]);
    } else {
      XMUDict.handlers[funName]();
    }
  });
}

$('#buttonExit').click(function() {
  window.close();
});

$('#buttonReset').click(function() {
  XMUDict.user.username = "";
  $('#username').val("");
  XMUDict.user.password = "";
  $('#password').val("");
  new XMUDict.Alert('清除成功！', 'success', 5000);
});

$('#grade button').click(function() {
  $('#grade').fadeOut(700);
  setTimeout(function() {
    $('#main').fadeIn(700);
  }, 400);
});
