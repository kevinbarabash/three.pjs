var camera, renderer, canvas, ctx;
var geometry, material, mesh, cube1, cube2;
var p, axes, raycaster;

function Mesh() {
    this.geometry = new THREE.Geometry();
    this.material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        wireframe: false
    });
    this.object = new THREE.Mesh(this.geometry, this.material);

    this.vertexGroup = new THREE.Object3D();
    this.vertexMaterial = new THREE.MeshBasicMaterial( { color: new THREE.Color(0,0,0) } );

    this.root = new THREE.Object3D();
    this.root.add(this.vertexGroup);
    this.root.add(this.object);
}

Mesh.prototype.addVertex = function (x, y, z) {
    var vertex = new THREE.Vector3(x, y, z);
    this.geometry.vertices.push(vertex);
    
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 8), this.vertexMaterial);
    sphere.position.set(x, y, z);
    this.vertexGroup.add(sphere);
};

Mesh.prototype.addFace = function () {
    var color = new THREE.Color(Math.random(), Math.random(), Math.random());

    var args = arguments;
    for (var i = 0; i < arguments.length - 2; i++) {
        var face = new THREE.Face3(args[0], args[i + 1], args[i + 2]);

        face.color = color;
        this.geometry.faces.push(face);
    }
};

var toScreenXY = function( position, camera, scene ) {
    var pos = position.clone();
    var projScreenMat = new THREE.Matrix4();
    projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
    projScreenMat.multiply(scene.matrix);
    pos.applyMatrix4(projScreenMat);

    return {
        x: ( pos.x + 1 ),
        y: ( -pos.y + 1)
    };
};

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
    p.currentScene = new THREE.Scene();

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
    cube1.root.position.x += 100;
    scene.add(cube1.root);

    cube2 = createCube(size);
    cube2.root.position.x -= 100;
    scene.add(cube2.root);
    
    var axes = createAxes(150);
    scene.add(axes);

    p.mouseClicked = function () {
        console.log("mouse clicked at (%d, %d)", p.mouseX, p.mouseY);
    };

    p.mouseDragged = function () {
        var speed = 0.5;
        var dx = speed * (p.mouseX - p.pmouseX);
        var dy = speed * (p.mouseY - p.pmouseY);

        var axis = new THREE.Vector3(dy, dx, 0);
        var angle = Math.PI * axis.length() / 180;

        if (axis.length() > 0.001) {
            axis = axis.normalize();

            var rotMatrix = new THREE.Matrix4();
            rotMatrix.makeRotationAxis(axis, angle);
            scene.applyMatrix(rotMatrix);

        }

        requestAnimationFrame( redraw );
    }
}

function isObjectVisible() {
    
    // TODO: each object needs to report which of it's sub objects should be considered visible
    // then we can build a list of objects which can occlude other objects
    
}

function drawOverlay(scene) {
    var vertexCount = cube1.geometry.vertices.length;
    
    for (var i = 0; i < vertexCount; i++) {
        var corner = cube1.geometry.vertices[i];
        var vector = corner.clone();
        vector.applyMatrix4(cube1.root.matrix);
        vector.applyMatrix4(scene.matrix);
        vector.z = 1000;    // the same z location as the camera

        var dir = new THREE.Vector3();
        dir.set(0, 0, -1).transformDirection(camera.matrixWorld);
        // z = -1 is pointing away from the camera into the screen

        raycaster.set( vector, dir );
        var objects = [];
        objects = objects.concat(cube1.vertexGroup.children, cube1.object);
        var intersects = raycaster.intersectObjects( objects );


        var transformedCorner = corner.clone().applyMatrix4(cube1.root.matrix);
        var point = toScreenXY(transformedCorner, camera, scene);
        
        for (var j = 0; j < intersects.length; j++) {
            if (intersects[j].object.visible) {
                if (intersects[j].object === cube1.vertexGroup.children[i]) {
                    point.x *= 200;
                    point.y *= 200;

                    ctx.fillText("" + i, point.x + 5, point.y);
                }
                break;
            }
        }
    }
}

function redraw() {
    var scene = p.currentScene;
    
    renderer.render( scene, camera );

    ctx.clearRect(0, 0, 400, 400);

    drawOverlay(scene);   
}

init();
setup();
redraw();

// TODO: multiple objects
// TODO: named objects
// TODO: toggle semitransparent faces
// TODO: toggle center point

document.querySelector("#showFaces").addEventListener("click", function (e) {
    if (e.target.checked) {
        cube1.object.visible = true;
    } else {
        cube1.object.visible = false;
    }
    redraw();
});

document.querySelector("#showAxes").addEventListener("click", function (e) {
    if (e.target.checked) {
        axes.visible = true;
    } else {
        axes.visible = false;
    }
    redraw();
});

