var animationId = 0;

var forwardAnimations;
var backwardAnimations;

function initializeAnimations() {
    forwardAnimations  = [];
    backwardAnimations = [];
}

function queueAnimation(animF, animB) {
    forwardAnimations.push(animF);
    backwardAnimations.push(animB);
}

function play() {
    if (animationId < 0) {
        animationId = 0;
        return;
    } else if (animationId >= forwardAnimations.length) {
        animationId = forwardAnimations.length -1 ;
        return;
    }

    forwardAnimations[animationId].play().promise().then(function () {
        animationId++;
        play();
    });
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

function highlightNode(id, color) {
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
    
    queueAnimation(animF, animB);
}

function highlightNodeBorder(id, color) {
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
    
    queueAnimation(animF, animB);
}

function highlightEdge(tail, head, color) {
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
    
    queueAnimation(animF, animB);
}