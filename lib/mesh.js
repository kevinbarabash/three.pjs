"use strict";

var _slice = Array.prototype.slice;
var _classProps = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Mesh = (function () {
  var Mesh = function Mesh() {
    this.geometry = new THREE.Geometry();
    this.material = new THREE.MeshBasicMaterial();
    this.material.vertexColors = THREE.FaceColors;
    this.object = new THREE.Mesh(this.geometry, this.material);
    this.object.wrapper = this;

    this.vertexGroup = new THREE.Object3D();
    this.vertexMaterial = new THREE.MeshBasicMaterial();
    this.vertexMaterial.color = new THREE.Color(0, 0, 0);

    this.root = new THREE.Object3D();
    this.root.add(this.vertexGroup);
    this.root.add(this.object);
  };

  Mesh.prototype.addVertex = function (x, y, z) {
    this.geometry.vertices.push(new THREE.Vector3(x, y, z));

    var sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 8), this.vertexMaterial);
    sphere.position.set(x, z, y);
    this.vertexGroup.add(sphere);
  };

  Mesh.prototype.addFace = function () {
    var indices = _slice.call(arguments);

    var color = new THREE.Color(Math.random(), Math.random(), Math.random());

    for (var i = 0; i < indices.length - 2; i++) {
      var face = new THREE.Face3(indices[0], indices[i + 1], indices[i + 2]);

      face.color = color;
      this.geometry.faces.push(face);
    }
  };

  _classProps(Mesh, null, {
    position: {
      get: function () {
        return this.root.position;
      },
      set: function (value) {
        this.root.position = value;
      }

      // TODO: add a private method to get the visible object(s)
    }
  });

  return Mesh;
})();