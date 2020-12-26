class LabelDisplay {
    constructor(ids, label) {
        this.label = label;
        this.elements = [];

        console.log('nodes:', ids);

        for(var i=0; i<ids.length; i++) {
            this.elements.push(cy.$(`#${ids[i]}`));
        }        
    }
    show() {
        for(var i=0; i<this.elements.length; i++) {

            let ref = this.elements[i].popperRef();
            this.elements[i].tippy = tippy(ref, {
                content: () => {
                    if (this.label == Infinity) {
                        return `cost = ∞`;
                    }
                    return `cost = ${this.label}`;
                },
                trigger: "manual",
                arrow: true,
                placement: "bottom",
                hideOnClick: false,
                multiple: true,
                sticky: true,
                interactive: true
            });

            this.elements[i].tippy.show();
        }
    }
}

var animationId = 0;

var forwardAnimations;
var backwardAnimations;

function initializeAnimations() {
    forwardAnimations  = [];
    backwardAnimations = [];
}

function queueAnimation(animF, animB, type) {
    forwardAnimations.push({'type': type, 'animation': animF});
    backwardAnimations.push({'type': type, 'animation': animB});
}

function play() {
    if (animationId < 0) {
        animationId = 0;
        return;
    } else if (animationId >= forwardAnimations.length) {
        animationId = forwardAnimations.length -1 ;
        return;
    }

    var anim = forwardAnimations[animationId]['animation'];
    var type = forwardAnimations[animationId]['type'];

    if (type == 'label') {
        anim.show();
        animationId++;
        play();
    } else {
        anim.play().promise('completed').then(function () {
            animationId++;
            play();
        });
    }
}

function pause() {
    forwardAnimations[animationId].pause();
}

function stop() {
    forwardAnimations[animationId].stop();
    cy.nodes().style( { 'background-color' : 'black' });
    cy.edges().style( { 'line-color' : '#ccc', 'target-arrow-color': '#ccc'});
    animationId = 0;
}

function stepForward() {
    if (animationId == forwardAnimations.length) {
        return;
    }
    
    pause();
    forwardAnimations[animationId++].progress(0.99).apply();
}

function stepBackward() {
    if (animationId <= 0) {
        return;
    }
    backwardAnimations[--animationId].progress(0).apply();
}

function anim_highlight_node(id, color) {
    var animF = cy.$(`#${id}`).animation({
        style: {
            'background-color': color
        },
        duration: 500
    });
    
    var animB = cy.$(`#${id}`).animation({
        style: {
            'background-color': 'black'
        },
        duration: 500
    });

    queueAnimation(animF, animB, 'node');
}

function anim_highlight_node_border(id, color) {
    var animF = cy.$('#' + id).animation({
                        style: {
                            'border-color': color
                        }
                    });
    
    var animB = cy.$('#' + id).animation({
                        style: {
                            'border-color': 'black'
                        }
                    });
    
    queueAnimation(animF, animB, 'border');
}

function anim_highlight_edge(tail, head, color) {
    var edge = cy.elements(`edge[source = "${tail}"][target = "${head}"]`);
    
    var animF = edge.animation({
        style: {
            'line-color': color,
            'target-arrow-color': color
        },
        duration: 500
    });
    
    var animB = edge.animation({
        style: {
            'line-color': '#ccc',
            'target-arrow-color': '#ccc'
        },
        duration: 500
    });
    
    queueAnimation(animF, animB, 'edge');
}

function anim_display_label(nodes, label) {
    var anim = new LabelDisplay(nodes, label);
    queueAnimation(anim, anim, 'label');
}