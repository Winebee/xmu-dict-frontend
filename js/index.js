// Declarations

window.XMUDict = window.XMUDict || {};

XMUDict.user = XMUDict.user || new User();
XMUDict.Alert = XMUDict.Alert || Alert;
XMUDict.lib = XMUDict.lib || {};

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

$('#grade button').click(function() {
  $('#grade').fadeOut(700);
  setTimeout(function() {
    $('#main').fadeIn(700);
  }, 400);
});

// Get weather
XMUDict.lib.getWeather();