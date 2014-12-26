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
    return new THREE.Line( axesGeom, axesMaterial, THREE.LinePieces );
}

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


class Scene {
    
    constructor(ctx) {
        this.ctx = ctx; // TODO: create a separate overlay object
        this.scene = new THREE.Scene();

        var axes = createAxes(150);
        this.scene.add(axes);
    }
    
    add(obj) {
        this.scene.add(obj.root);
    }
    
    remove(obj) {
        this.scene.remove(obj.root);
    }
    
    get matrix() {
        return this.scene.matrix;
    }
    
    render(camera) {
        renderer.render(this.scene, camera);
    }
    
    rotate(axis, angle) {
        var rotMatrix = new THREE.Matrix4();
        rotMatrix.makeRotationAxis(axis.normalize(), angle);
        this.scene.applyMatrix(rotMatrix);
    }
    
    drawOverlay(selection, camera) {
        this.ctx.clearRect(0, 0, 400, 400);

        if (selection === null) {
            return;
        }

        var vertexCount = selection.geometry.vertices.length;

        for (var i = 0; i < vertexCount; i++) {
            var corner = selection.geometry.vertices[i];
            var vector = corner.clone();
            vector.applyMatrix4(selection.root.matrix);
            vector.applyMatrix4(this.scene.matrix);
            vector.z = 1000;    // the same z location as the camera

            var dir = new THREE.Vector3();
            dir.set(0, 0, -1).transformDirection(camera.matrixWorld);
            // z = -1 is pointing away from the camera into the screen

            raycaster.set( vector, dir );
            var objects = [];
            objects = objects.concat(selection.vertexGroup.children[i], cube1.object, cube2.object);
            
            var intersects = raycaster.intersectObjects( objects );
            
            for (var j = 0; j < intersects.length; j++) {
                if (intersects[j].object.visible) {
                    if (intersects[j].object === selection.vertexGroup.children[i]) {
                        var transformedCorner = corner.clone().applyMatrix4(selection.root.matrix);
                        var point = toScreenXY(transformedCorner, camera, this.scene);
                        
                        point.x *= 200;
                        point.y *= 200;

                        this.ctx.fillText("" + i, point.x + 5, point.y);
                    }
                    break;
                }
            }
        }
    }
}
