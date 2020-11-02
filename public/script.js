var myCodeMirror = CodeMirror(document.getElementById("sidebar-left"),{
    value:"def example():\n\tprint(\"Hello, world!\")\n\nexample()",
    mode: "python",
    theme: "monokai",
    lineNumbers:true
});
myCodeMirror.setSize("100%", "80%");

Split(['#sidebar-left', '#content'], {
    gutterSize: 4,
    sizes: [20, 80]
});

var sidebarLeft   = document.getElementById("sidebar-left");
var collapseLeft  = document.getElementById("collapse-left");
var sidebarRight  = document.getElementById("sidebar-right");
var collapseRight = document.getElementById("collapse-right");
var gutter        = document.getElementsByClassName("gutter")[0];


// Disable transition animation when manually resizing sidebar
gutter.onmousedown = function() {
    sidebarLeft.classList.remove('transition');
}

// Toggle right sidebar with transition animation
collapseRight.onclick = function() {
    var offset = window.innerWidth - (sidebarRight.offsetLeft + sidebarRight.clientWidth);
    if (offset < 0) {
        sidebarRight.style.marginRight = '0px';
    }
    else {
        sidebarRight.style.marginRight = -sidebarRight.clientWidth + 'px';
    }
};

// Toggle left sidebar with transition animation
collapseLeft.onclick = function() {
    sidebarLeft.classList.add('transition');
    if (sidebarLeft.offsetLeft < 0) {
        sidebarLeft.style.marginLeft = '0px';
    } 
    else {
        sidebarLeft.style.marginLeft = -sidebarLeft.clientWidth + 'px';
    }
};