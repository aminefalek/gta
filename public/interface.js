var min = 500;
var max = 800;
var mainmin = 200;

$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX;
        console.log(x);
        if (x > min && x < max && e.pageX < ($(window).width() - mainmin)) {  
          $('#menu').css("width", x);
          $('#main').css("margin-left", x);
        }
    })
});
$(document).mouseup(function (e) {
    $(document).unbind('mousemove');
});