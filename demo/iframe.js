var camera, renderer, canvas, ctx;
var geometry, material, mesh, cube1, cube2;
var p, axes, raycaster, selection;


function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(new THREE.Color(1,1,1));
    document.body.appendChild(renderer.domElement);

    canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    ctx.font = "20px sans-serif";

    p = new Processing(canvas);
    p.currentScene = new Scene(ctx);

    // +x left
    // +y up
    camera = new THREE.OrthographicCamera(-200, 200, 200, -200, 1, 2000);
    camera.position.z = 1000;

    // remove all drawing methods
    var drawingMethods = [
        "translate", "transform", "scale", "pushMatrix", "popMatrix",
        "resetMatrix", "applyMatrix", "rotate", "rotateZ", "shearX",
        "shearY", "redraw", "toImageData", "ambientLight",
        "directionalLight", "lightFalloff", "lightSpecular", "pointLight",
        "noLights", "spotLight", "beginCamera", "endCamera", "frustum",
        "box", "sphere", "ambient", "emissive", "shininess", "specular",
        "fill", "stroke", "strokeWeight", "smooth", "noSmooth", "point",
        "vertex", "endShape", "bezierVertex", "curveVertex", "curve",
        "line", "bezier", "rect", "ellipse", "background", "image",
        "textWidth", "text$line", "$ensureContext", "$newPMatrix"
    ];

    drawingMethods.forEach(function (methodName) {
        delete p[methodName];
    });

    // add our own methods for rendering/animating 3D scenes

    raycaster = new THREE.Raycaster();
}

function createCube(size) {
    var cube = new Mesh();

    cube.addVertex(-size, -size, -size);
    cube.addVertex( size, -size, -size);
    cube.addVertex( size,  size, -size);
    cube.addVertex(-size,  size, -size);
    cube.addVertex(-size, -size,  size);
    cube.addVertex( size, -size,  size);
    cube.addVertex( size,  size,  size);
    cube.addVertex(-size,  size,  size);

    cube.addFace(3, 2, 1, 0);
    cube.addFace(4, 5, 6, 7);
    cube.addFace(0, 4, 7, 3);
    cube.addFace(1, 2, 6, 5);
    cube.addFace(3, 7, 6, 2);
    cube.addFace(0, 1, 5, 4);

    cube.geometry.computeFaceNormals();
    cube.geometry.computeVertexNormals();
    
    return cube;
}

function createAxes(length) {
    var axesGeom = new THREE.Geometry();
    axesGeom.vertices.push(new THREE.Vector3(-length,0,0));
    axesGeom.vertices.push(new THREE.Vector3(length,0,0));
    axesGeom.vertices.push(new THREE.Vector3(0,-length,0));
    axesGeom.vertices.push(new THREE.Vector3(0,length,0));
    axesGeom.vertices.push(new THREE.Vector3(0,0,-length));
    axesGeom.vertices.push(new THREE.Vector3(0,0,length));
    var axesMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0.25, 0.25, 0.25),
        linewidth: 2

    });
    axes = new THREE.Line( axesGeom, axesMaterial, THREE.LinePieces );
    return axes;
}

function setup() {
    var size = 60;
    var scene = p.currentScene;

    cube1 = createCube(size);
    cube1.position.x += 100;
    scene.add(cube1);

    cube2 = createCube(size);
    cube2.position.x -= 100;
    scene.add(cube2);
    
    selection = cube1;

    p.mouseClicked = function () {
        console.log("mouse clicked at (%d, %d)", p.mouseX, p.mouseY);

        var vector = new THREE.Vector3(p.mouseX - 200, 200 - p.mouseY, 1000);
        var dir = new THREE.Vector3(0, 0, -1);
        dir.transformDirection(camera.matrixWorld);
        // z = -1 is pointing away from the camera into the screen

        raycaster.set( vector, dir );
        var objects = [cube1.object, cube2.object];
        var intersects = raycaster.intersectObjects( objects );
        console.log(intersects);
        
        
        if (intersects.length > 0) {
            if (selection && selection !== intersects[0].object.wrapper) {
                selection.object.visible = true;
            }
            selection = intersects[0].object.wrapper;
        } else {
            if (selection) {
                selection.object.visible = true;
            }
            selection = null;
        }
        
        redraw();
    };

    p.mouseDragged = function () {
        var speed = 0.5;
        var dx = speed * (p.mouseX - p.pmouseX);
        var dy = speed * (p.mouseY - p.pmouseY);

        var axis = new THREE.Vector3(dy, dx, 0);
        var angle = Math.PI * axis.length() / 180;

        if (axis.length() > 0.001) {
            scene.rotate(axis, angle);
        }

        requestAnimationFrame( redraw );
    };
}

function isObjectVisible() {
    
    // TODO: each object needs to report which of it's sub objects should be considered visible
    // then we can build a list of objects which can occlude other objects
    
}



function redraw() {
    var scene = p.currentScene;
    
    // TODO: active/default camera
    scene.render(camera);
    scene.drawOverlay(selection, camera);
}

init();
setup();
redraw();

// TODO: multiple objects
// TODO: named objects
// TODO: toggle semitransparent faces
// TODO: toggle center point

iframeOverlay.createRelay(canvas);

var poster = new Poster(window.parent);

poster.listen("showFaces", function (state) {
    if (selection) {
        selection.object.visible = state;
        redraw(); 
    }
});

poster.listen("showAxes", function (state) {
    axes.visible = state;
    redraw();
});
