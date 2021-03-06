class Alert {
  constructor(content, level, timeout) {
    if(!content || !level) return;
    this.elem = document.createElement('div');
    this.elem.innerHTML = this.__getHtml__(content, level);
    $(this.elem).css({
      'position': 'fixed',
      'z-index': '999',
      'top': '1em',
      'display': 'none'
    }).addClass("container-fluid");
    var _this = this;
    if(timeout) {
      setTimeout(function() {
        _this.remove();
      }, timeout);
    }
    document.body.append(this.elem);
    $(this.elem).fadeIn(700);
  }

  remove() {
    if(this.elem) {
      $(this.elem).fadeOut(500);
      let _this = this;
      setTimeout(function() {
        _this.elem.remove();
        _this.elem = null;
      }, 550);
    }
  }

  __getHtml__(content, level) {
    return `<div class="alert alert-${level} alert-dismissible fade show" role="alert">
      ${content}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
  }

};
