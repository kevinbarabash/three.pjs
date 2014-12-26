"use strict";

var _classProps = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

function createAxes(length) {
  var axesGeom = new THREE.Geometry();
  axesGeom.vertices.push(new THREE.Vector3(-length, 0, 0));
  axesGeom.vertices.push(new THREE.Vector3(length, 0, 0));
  axesGeom.vertices.push(new THREE.Vector3(0, -length, 0));
  axesGeom.vertices.push(new THREE.Vector3(0, length, 0));
  axesGeom.vertices.push(new THREE.Vector3(0, 0, -length));
  axesGeom.vertices.push(new THREE.Vector3(0, 0, length));
  var axesMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(0.25, 0.25, 0.25),
    linewidth: 2

  });
  return new THREE.Line(axesGeom, axesMaterial, THREE.LinePieces);
}

var toScreenXY = function (position, camera, scene) {
  var pos = position.clone();
  var projScreenMat = new THREE.Matrix4();
  projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  projScreenMat.multiply(scene.matrix);
  pos.applyMatrix4(projScreenMat);

  return {
    x: (pos.x + 1),
    y: (-pos.y + 1)
  };
};


var Scene = (function () {
  var Scene = function Scene(ctx) {
    this.ctx = ctx; // TODO: create a separate overlay object
    this.scene = new THREE.Scene();

    var axes = createAxes(150);
    this.scene.add(axes);
  };

  Scene.prototype.add = function (obj) {
    this.scene.add(obj.root);
  };

  Scene.prototype.remove = function (obj) {
    this.scene.remove(obj.root);
  };

  Scene.prototype.render = function (camera) {
    renderer.render(this.scene, camera);
  };

  Scene.prototype.rotate = function (axis, angle) {
    var rotMatrix = new THREE.Matrix4();
    rotMatrix.makeRotationAxis(axis.normalize(), angle);
    this.scene.applyMatrix(rotMatrix);
  };

  Scene.prototype.drawOverlay = function (selection, camera) {
    this.ctx.clearRect(0, 0, 400, 400);

    if (selection === null) {
      return;
    }

    var vertexCount = selection.geometry.vertices.length;
    var raycaster = new THREE.Raycaster();


    for (var i = 0; i < vertexCount; i++) {
      var vector = selection.vertexGroup.children[i].position.clone();
      vector.applyMatrix4(selection.root.matrix);
      vector.applyMatrix4(this.scene.matrix);
      vector.z = 1000; // the same z location as the camera

      var dir = new THREE.Vector3();
      dir.set(0, 0, -1).transformDirection(camera.matrixWorld);

      raycaster.set(vector, dir);

      var objects = [];
      objects.push(cube1.object);
      objects.push(cube2.object);
      objects.push(selection.vertexGroup.children[i]);

      var intersects = raycaster.intersectObjects(objects);

      for (var j = 0; j < intersects.length; j++) {
        if (intersects[j].object.visible) {
          if (intersects[j].object === selection.vertexGroup.children[i]) {
            var transformedCorner = selection.vertexGroup.children[i].position.clone().applyMatrix4(selection.root.matrix);
            var point = toScreenXY(transformedCorner, camera, this.scene);

            point.x *= 200;
            point.y *= 200;

            this.ctx.fillText("" + i, point.x + 5, point.y);
          }
          break;
        }
      }
    }
  };

  _classProps(Scene, null, {
    matrix: {
      get: function () {
        return this.scene.matrix;
      }
    }
  });

  return Scene;
})();