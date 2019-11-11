var animations = [];

export function resetAnimations() {
    animations = [];
}

export function queueAnimation(cy, id) {
    console.log("queued: ", id);
    var animation = cy.$('#' + id).animation({
                        style: {
                            'background-color': 'yellow'
                        }
                    }, {
                        duration: 1000,
                        complete: function() {
                        }
                    });
    
    animations.push(animation);
}

function playAnimation(i) {
    console.log("animation: ", i);
    if (i === animations.length) {
        return;
    }
    animations[i].play().promise().then(function () {
        playAnimation(i+1)
    });
}

export function animate() {
    playAnimation(0);
}