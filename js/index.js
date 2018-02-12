// Declarations

window.XMUDict = window.XMUDict || {};

XMUDict.user = XMUDict.user || new User();
XMUDict.room = {};
XMUDict.Alert = XMUDict.Alert || Alert;
XMUDict.lib = XMUDict.lib || {};

XMUDict.renderer = {
  grade: function(data) {
    $('#grade button.btn-gpa').html('完整视图（包含绩点，慎入）');
    XMUDict.grade = data;
    XMUDict.lib.getGPA();
    console.log(XMUDict.grade);
    var htmlMain = '', htmlFull = '';
    XMUDict.grade.forEach(function(term, termIndex) {
      htmlMain += `
        <tr class="text-light bg-dark">
          <th colspan="2" scope="row">${term.name}</th>
        </tr>
      `;
      htmlFull += `
        <tr class="text-light bg-dark">
          <th colspan="8" scope="row">${term.name}</th>
          <th>
            <div class="form-check form-check-inline cb-gpa">
              <input class="form-check-input" type="checkbox" data-grade-term="${termIndex}" id="grade_${termIndex}">
              <label class="form-check-label" for="grade_${termIndex}">全选</label>
            </div>
          </th>
        </tr>
      `;
      term.subjects.forEach(function(subject, subjectIndex) {
        htmlMain += `
          <tr>
            <th scope="row">${subject.name}</th>
            <td>${subject.grade}</td>
          </tr>
        `;
        htmlFull += `
          <tr>
            <th scope="row">${subject.name}</th>
            <td>${subject.credit}</td>
            <td>${subject.courseType}</td>
            <td>${subject.takingType}</td>
            <td>${subject.grade}</td>
            <td>${subject.specialReason}</td>
            <td>${subject.ranking}</td>
            <td>${subject.GPA || ''}</td>
            <td>
              ${subject.GPA ? `
              <div class="form-check form-check-inline cb-gpa">
                <input class="form-check-input position-static cb-gpa-subject cb-gpa-${termIndex}" type="checkbox" data-grade-term="${termIndex}" data-grade-subject="${subjectIndex}" id="grade_${termIndex}_${subjectIndex}">
              </div>
              ` : ''}
            </td>
          </tr>
        `;
      });
      htmlFull += `
        <tr>
          <th colspan="7" scope="row">学期绩点</th>
          <td colspan="2" id="gradeTermGPA_${termIndex}">${term.GPA}</td>
        </tr>
      `
    });
    $('#gradeMain tbody').html(htmlMain);
    $('#gradeFull tbody').html(htmlFull);
    $('#gradeFull caption').html(`总绩点：${XMUDict.grade.GPA}`);
    $('#gradeFull .cb-gpa input').prop('checked', true);

    var termCount = XMUDict.grade.length;
    for(let i = 0; i < termCount; i++) {
      $(`#grade_${i}`).change(function() {
        if(this.checked) {
          $(`.cb-gpa-${i}`).prop('checked', true);
        } else {
          $(`.cb-gpa-${i}`).prop('checked', false);
        }
        XMUDict.lib.getGPA(true);
        if(!this.dataset.gradeTerm) {
          console.warn('[ grade ] data-grade-term not found.');
          for(let j = 0; j < termCount; j++) {
            XMUDict.renderer.gradeRerender(j);
          }
        } else {
          XMUDict.renderer.gradeRerender(this.dataset.gradeTerm);
        }
      });
    }

    $('.cb-gpa-subject').change(function() {
      XMUDict.lib.getGPA(true);
      if(!this.dataset.gradeTerm) {
        console.warn('[ grade ] data-grade-term not found.');
        for(let j = 0; j < termCount; j++) {
          XMUDict.renderer.gradeRerender(j);
        }
      } else {
        XMUDict.renderer.gradeRerender(this.dataset.gradeTerm);
      }
    });

    $('#main').fadeOut(700);
    setTimeout(function() {
      $('#grade').fadeIn(700);
    }, 400);
  },
  gradeRerender: function(termIndex) {
    if(XMUDict.grade[termIndex]) {
      $(`#gradeTermGPA_${termIndex}`).html(XMUDict.grade[termIndex].GPA);
      $('#gradeFull caption').html(`总绩点：${XMUDict.grade.GPA}`);
    } else {
      console.error('[ grade ] No such index of term:', termIndex);
    }
  },
  card: function(data) {
    console.log(data);
    var balance = parseFloat(data.balance);
    // new XMUDict.Alert(`${balance >= 80 ? '土豪，' : ''}你的校园卡里${balance <= 20 ? '只' : '还'}剩${balance <= 20 ? '<span class="text-danger">' : '<span class="text-primary">'}${data.balance}</span>${balance <= 20 ? '啦' : ''}`, 'success', 5000);
    $('#buttonCard').html(`${balance >= 80 ? '土豪，' : ''}你的校园卡里${balance <= 20 ? '只' : '还'}剩${balance <= 20 ? '<span class="text-danger">' : ''}${data.balance}</span>${balance <= 20 ? '啦' : ''}`);
  },
  elec: function(data) {
    console.log(data);
    XMUDict.elec = data;
    var html = '';
    for(var record of XMUDict.elec.consumptions) {
      html += `
        <tr>
          <th scope="row">${record.date.replace('No data to display', '无')}</th>
          <td>${record.paymentUse}</td>
          <td>${record.subsidyUse}</td>
          <td>${record.sumUse}</td>
          <td>${record.paymentBalance}</td>
          <td>${record.subsidyBalance}</td>
          <td>${record.sumBalance}</td>
        </tr>
      `;
    }
    $($('#elec tbody')[1]).html(html);
    html = '';
    for(var record of XMUDict.elec.payments) {
      html += `
      <tr>
        <th scope="row">${record.roomID.replace('No data to display', '无')}</th>
        <td>${record.time}</td>
        <td>${record.account}</td>
        <td>${record.roomName}</td>
        <td>${record.money}</td>
      </tr>
      `;
    }
    $($('#elec tbody')[0]).html(html);
    $('#main').fadeOut(700);
    setTimeout(function() {
      $('#elec').fadeIn(700);
    }, 400);
  }
};

XMUDict.handlers = {
  error: function(xhr, info, err) {
    console.log(xhr);
    // if(xhr.status == 502) {
    //   return new XMUDict.Alert('登录失败 :(', 'danger', 5000);
    // }
    new XMUDict.Alert(xhr.responseJSON && xhr.responseJSON.msg || '未知错误 :(', 'dark', 5000);
  }
};

XMUDict.handlers.grade = function() {
  $.ajax({
    url: '/grade/?username=' + XMUDict.user.username + '&password=' + XMUDict.user.password,
    type: 'GET',
    timeout: 5000,
    data: "",
    success: XMUDict.renderer.grade,
    error: XMUDict.handlers.error
  });
};
XMUDict.handlers.card = function() {
  $.ajax({
    url: '/card/?username=' + XMUDict.user.username + '&password=' + XMUDict.user.password,
    type: 'GET',
    timeout: 5000,
    data: "",
    success: XMUDict.renderer.card,
    error: XMUDict.handlers.error
  });
};
XMUDict.handlers.elec = function(next) {
  console.log('[ elec ] Getting room info.');
  $('#elecModal').modal('show');
  $('#elecModalStart').unbind('click');
  $('#elecModalStart').one('click', function() {
    XMUDict.room.campus = $('#campus').val();
    XMUDict.room.building = $('#building').val();
    XMUDict.room.id = $('#roomID').val();
    $('#elecModal').modal('hide');
    var now = new Date((new Date).toLocaleDateString());
    $.ajax({
      url: `/elec/?drxiaoqu=${XMUDict.room.campus}&drlou=${XMUDict.room.building}&txtRoomid=${XMUDict.room.id}&dxdateStart_Raw=${now - 10 * 24 * 3600 * 1000}&dxdateEnd_Raw=${now.getTime()}`,
      type: 'GET',
      timeout: 5000,
      data: "",
      success: XMUDict.renderer.elec,
      error: XMUDict.handlers.error
    });
  });
};
XMUDict.handlers.auth = function(next) {
  if(!!XMUDict.user.username && !!XMUDict.user.password && XMUDict.user.username != "" && XMUDict.user.password != "") {
    return next();
  } else {
    console.log('[ Auth ] Logging in.');
    $('#authModal').modal('show');
    $('#authModalStart').unbind('click');
    $('#authModalStart').one('click', function() {
      XMUDict.user.username = $('#username').val();
      XMUDict.user.password = $('#password').val();
      XMUDict.handlers.auth(next);
      $('#authModal').modal('hide');
    });
  }
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

// Set carousel control icons' color
(function() {
  var tmp = $('#slider span.carousel-control-next-icon').css('background-image');
  $('#slider span.carousel-control-next-icon').css('background-image', tmp.replace('%23fff', '%23000'));
  tmp = $('#slider span.carousel-control-prev-icon').css('background-image');
  $('#slider span.carousel-control-prev-icon').css('background-image', tmp.replace('%23fff', '%23000'));
})();

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

(function() {
  $('#grade button.btn-back').click(function() {
    $('#grade').fadeOut(700);
    setTimeout(function() {
      $('#main').fadeIn(700);
    }, 400);
  });

  $('#grade button.btn-gpa').click(function() {
    if(XMUDict.fullGrade) {
      $('#grade button.btn-gpa').html('再看看');
    } else {
      $('#grade button.btn-gpa').html('算了我看不下去了');
    }
    XMUDict.fullGrade = !XMUDict.fullGrade;
    $('#gradeFull').toggle();
    $('#gradeMain').toggle();
  })

  // $('#gradeMain .cb-gpa input').prop('checked', true);
  $('#gradeAll').change(function() {
    if(this.checked) {
      $('#gradeFull .cb-gpa input').prop('checked', true);
    } else {
      $('#gradeFull .cb-gpa input').prop('checked', false);
    }
    XMUDict.lib.getGPA(true);
    let termCount = XMUDict.grade && XMUDict.grade.length || -1;
    for(let j = 0; j < termCount; j++) {
      XMUDict.renderer.gradeRerender(j);
    }
  });
  
  $('#grade button.btn-gpa').click(function() {
    // $('#grade thead tr').append('<th>全选</th>');
  });
})();

(function() {
  $('#elec button').click(function() {
    $('#elec').fadeOut(700);
    setTimeout(function() {
      $('#main').fadeIn(700);
    }, 400);
  });

  var campus = $('#campus');
  var building = $('#building');
  campus.empty();
  campus.append(`<option disabled selected class="font-weight-bold">请选择校区</option>`);
  building.empty();
  for(var campusName in XMUDict.lib.ELEC_MAP) {
    campus.append(`<option value=${XMUDict.lib.ELEC_MAP[campusName].value}>${campusName}</option>`);
  }
  campus.change(function() {
    building.empty();
    building.append(`<option disabled selected class="font-weight-bold">请选择宿舍楼</option>`);
    var campusName = campus[0].selectedOptions[0].text;
    if(!campusName) return;
    var buildings = XMUDict.lib.ELEC_MAP[campusName].buildings;
    for(var buildingName in buildings) {
      building.append(`<option value=${buildings[buildingName]}>${buildingName}</option>`);
    }
  });
})();

// Get weather
XMUDict.lib.getWeather();

// Get card balance
if(!!XMUDict.user.username && !!XMUDict.user.password && XMUDict.user.username != "" && XMUDict.user.password != "") {
  $('#buttonCard').click();
}
