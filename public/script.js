const navbar        = document.getElementById("navbar");
const control       = document.getElementById("control");
const sidebarLeft   = document.getElementById("sidebar-left");
const sidebarRight  = document.getElementById("sidebar-right");
const collapseLeft  = document.getElementById("collapse-left");
const collapseRight = document.getElementById("collapse-right");
const content       = document.getElementById('content');

const codeMirror = CodeMirror(navbar, {
    value:"def example():\n\tprint(\"Hello, world!\")\n\nexample()",
    mode: "python",
    theme: "monokai",
    lineNumbers:true
});
codeMirror.setSize("100%", "100%");

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

document.addEventListener('DOMContentLoaded', function() {
    const resizable = function(resizer) {
        const direction   = resizer.getAttribute('data-direction') || 'horizontal';
        var side1, side2;

        if (direction === 'vertical') {
            side1 = navbar;
            side2 = control;
        } else {
            side1 = sidebarLeft;
            side2 = content;
        }

        // The current position of mouse
        let x = 0;
        let y = 0;
        let side1Height = 0;
        let side1Width  = 0;

        // Handle the mousedown event
        const mouseDownHandler = function(e) {
            // Disable transition animation when manually resizing sidebar
            sidebarLeft.classList.remove('transition');

            // Get the current mouse position
            x = e.clientX;
            y = e.clientY;
            const rect = side1.getBoundingClientRect();
            side1Height = rect.height;
            side1Width  = rect.width;

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function(e) {
            const dx = e.clientX - x;
            const dy = e.clientY - y;

            switch (direction) {
                case 'vertical':
                    const h = (side1Height + dy) * 100 / resizer.parentNode.getBoundingClientRect().height;
                    side1.style.height = `${h}%`;
                    break;
                case 'horizontal':
                default:
                    const w = (side1Width + dx) * 100 / resizer.parentNode.getBoundingClientRect().width;
                    side1.style.width = `${w}%`;
                    break;
            }

            const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
            resizer.style.cursor = cursor;
            document.body.style.cursor = cursor;

            side1.style.userSelect = 'none';
            side1.style.pointerEvents = 'none';

            side2.style.userSelect = 'none';
            side2.style.pointerEvents = 'none';
        };

        const mouseUpHandler = function() {
            resizer.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');

            side1.style.removeProperty('user-select');
            side1.style.removeProperty('pointer-events');

            side2.style.removeProperty('user-select');
            side2.style.removeProperty('pointer-events');

            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        // Attach the handler
        resizer.addEventListener('mousedown', mouseDownHandler);
    };

    // Query all resizers
    document.querySelectorAll('.resizer').forEach(function(ele) {
        resizable(ele);
    });
});