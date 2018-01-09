const hideGif = function () {
  document.getElementById('gif').style.visibility = 'hidden';
  setInterval(showGif, 1000);
}

const showGif = function () {
  document.getElementById('gif').style.visibility = 'visible';
}
