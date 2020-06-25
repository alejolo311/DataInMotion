window.onload = function () {
  let demo = document.getElementsByClassName('demo_button')[0];
  demo.addEventListener('click', function (evn) {
    console.log('Launch Demo');
    fetch('/launch_demo').then(function (resp) {
      return resp.json();
    }).then(function (resp) {
      console.log(resp);
      window.open(`/user/${resp.id}/boards`, '_self');
    });
  });
};