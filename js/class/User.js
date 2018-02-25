class User {
  constructor() {

  }

  set username(name) {
    localStorage.setItem("username", name);
  }

  get username() {
    return localStorage.getItem("username");
  }

  set password(passwd) {
    localStorage.setItem("password", passwd);
  }

  get password() {
    return localStorage.getItem("password");
  }

  set room(info) {
    localStorage.setItem("roomInfo", JSON.stringify(info));
  }

  get room() {
    return JSON.parse(localStorage.getItem("roomInfo") || "{}");
  }
}
