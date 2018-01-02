// initialize

window.XMUDict = {};

XMUDict.user = new User();
XMUDict.Alert = Alert;

XMUDict.renderer = {
  grade: function(data) {
    console.log(data);
  },
  card: function(data) {
    console.log(data);
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

$('#buttonReset').click(function() {
  XMUDict.user.username = "";
  $('#username').val("");
  XMUDict.user.password = "";
  $('#password').val("");
});
