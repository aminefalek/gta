// import { queueAnimation, highlightNode, highlightEdge } from '../animation.js';

function outf(text) { 
    var mypre = document.getElementById("output"); 
    mypre.innerHTML = "lolz" + text; 
} 

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

export function custom(graph, cy, root) {
    var prog = document.getElementById("cm").value; 
    var mypre = document.getElementById("output"); 
    
    Sk.pre = "output";
    Sk.configure({output:outf, read:builtinRead}); 
    mypre.innerHTML = ''; 
    var myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });

    myPromise.then(function(mod) {
        console.log('success');
    },
        function(err) {
        console.log(err.toString());
    });
    
}