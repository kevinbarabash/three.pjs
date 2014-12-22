var iframe = document.querySelector("iframe");

iframeOverlay.createOverlay(iframe);

var poster = new Poster(iframe);

document.querySelector("#showFaces").addEventListener("click", function (e) {
    poster.post("showFaces", e.target.checked);
});

document.querySelector("#showAxes").addEventListener("click", function (e) {
    poster.post("showAxes", e.target.checked);
});

