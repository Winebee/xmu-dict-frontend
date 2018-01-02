class User {
  constructor() {

  }

  set username(name) {
    sessionStorage.setItem("username", name);
  }

  get username() {
    return sessionStorage.getItem("username");
  }

  set password(passwd) {
    sessionStorage.setItem("password", passwd);
  }

  get password() {
    return sessionStorage.getItem("password");
  }
}
