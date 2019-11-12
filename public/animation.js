var cy;
var duration;
var currentAnimationId = 0;

var animationsForward  = [];
var animationsBackward = [];

export function initializeAnimations(cy_, duration_) {
    cy = cy_;
    duration = duration_;
    animationsForward  = [];
    animationsBackward = [];
}

export function queueAnimation(animF, animB) {
    animationsForward.push(animF);
    animationsBackward.push(animB);
}

export function play() {
    if (currentAnimationId == animationsForward.length) {
        return;
    }
    console.log("animation: ", currentAnimationId);
    animationsForward[currentAnimationId].play().promise().then(function () {
        play(++currentAnimationId)
    });
}

export function pause() {
    for (var i=currentAnimationId; i<animationsForward.length; i++) {
        animationsForward[i].pause();
    }
}

export function stop() {
    pause();
    cy.nodes().style( { 'background-color' : 'black' });
    cy.edges().style( { 'line-color' : '#ccc', 'target-arrow-color': '#ccc'});
    currentAnimationId = 0;
    animationsForward  = [];
    animationsBackward = [];
}

export function stepForward() {
    if (currentAnimationId == animationsForward.length) {
        return;
    }
    pause();
    animationsForward[currentAnimationId++].progress(0.99).apply();
}

export function stepBackward() {
    if (currentAnimationId == 0) {
        return;
    }
    pause();
    animationsBackward[--currentAnimationId].progress(0).apply();
}