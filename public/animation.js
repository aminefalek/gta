var cy;
var duration;
var currentAnimationId = 0;
var didStop = false;

var animationsForward;
var animationsBackward;

export function initializeAnimations(cy_) {
    cy = cy_;
    animationsForward  = [];
    animationsBackward = [];
    
    console.log("anims: ", animationsForward);
}

export function queueAnimation(animF, animB) {
    animationsForward.push(animF);
    animationsBackward.push(animB);
}

export function play() {
    if (currentAnimationId < 0) {
        currentAnimationId = 0;
    }
    else if (currentAnimationId >= animationsForward.length) {
        currentAnimationId = animationsForward.length -1 ;
        return;
    }
    
    console.log("animation: ", currentAnimationId);
    animationsForward[currentAnimationId].play().promise().then(function () {
        currentAnimationId++;
        play();
    });
}

export function pause() {
    animationsForward[currentAnimationId].pause();
}

export function stop() {
    console.log('anim id: ', currentAnimationId);
    animationsForward[currentAnimationId].stop();
    cy.nodes().style( { 'background-color' : 'black' });
    cy.edges().style( { 'line-color' : '#ccc', 'target-arrow-color': '#ccc'});
    currentAnimationId = 0;
}

export function stepForward() {
    if (currentAnimationId == animationsForward.length) {
        return;
    }
    
    pause();
    animationsForward[currentAnimationId++].progress(0.99).apply();
}

export function stepBackward() {
    if (currentAnimationId <= 0) {
        return;
    }
    animationsBackward[--currentAnimationId].progress(0).apply();
}

export function highlightNode(id, color) {
    var animF = cy.$('#' + id).animation({
                        style: {
                            'background-color': color
                        }
                    });
    
    var animB = cy.$('#' + id).animation({
                        style: {
                            'background-color': 'black'
                        }
                    });
    
    queueAnimation(animF, animB);
}

export function highlightNodeBorder(id, color) {
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

export function highlightEdge(tail, head, color) {
    var animF = cy.elements(`edge[source = "${tail}"][target = "${head}"]`).animation({
                        style: {
                            'line-color': 'red',
                            'target-arrow-color': color
                        }
                    });
    
    var animB = cy.elements(`edge[source = "${tail}"][target = "${head}"]`).animation({
                        style: {
                            'line-color': '#ccc',
                            'target-arrow-color': '#ccc'
                        }
                    });
    
    queueAnimation(animF, animB);
}