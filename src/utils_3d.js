import * as THREE from 'three';
// This is a namespace, the class syntax is just a limitation of js
// It should not be instanciated, access only to the static methods
export class Utils3D {
    /**
     * You should not see this. Do not instanciate this class
     */
    constructor() { }

    static createBox = (x, y, z, color = 0xffffff, opacity = 0.2, visible = true,) => {
        const geometry = new THREE.BoxGeometry(x, y, z);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const cube = new THREE.Mesh(geometry, material);
        const wireframeGeo = new THREE.EdgesGeometry(cube.geometry)
        const mat = new THREE.LineBasicMaterial({ color: "black", linewidth: 2 })
        const wireframe = new THREE.LineSegments(wireframeGeo, mat)
        wireframe.renderOrder = 1
        cube.add(wireframe)
        cube.material.transparent = true
        cube.material.opacity = opacity
        cube.visible = visible
        return cube
    }

    // The rotation is relative to the current position of the object
    // obj - your object (THREE.Object3D or derived)
    // point - the point of rotation (THREE.Vector3)
    // axis - the axis of rotation (normalized THREE.Vector3)
    // theta - radian value of rotation
    // pointIsWorld - boolean indicating the point is in world coordinates (default = false)
    static rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
        pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

        if (pointIsWorld) {
            obj.parent.localToWorld(obj.position); // compensate for world coordinate
        }

        obj.position.sub(point); // remove the offset
        obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
        obj.position.add(point); // re-add the offset

        if (pointIsWorld) {
            obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
        }

        obj.rotateOnAxis(axis, theta); // rotate the OBJECT
    }

    static createLine(origin, end, color, thickness) {
        // Create a line geometry
        const geometry = new THREE.BufferGeometry();
        const vertices = [
            origin.x, origin.y, origin.z,
            end.x, end.y, end.z
        ];
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // Create a material for the line
        const material = new THREE.LineBasicMaterial({ color: color });

        // Create the line object
        const line = new THREE.Line(geometry, material);

        // Create a tube geometry around the line to give it thickness
        const points = [origin, end];
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 1, thickness, 8, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: color });
        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);

        // Add the tube mesh to the line object
        line.add(tubeMesh);

        return line;
    }

    static findCenterPoint(vectorA, vectorB) {
        // Calculate the average of x, y, and z coordinates separately
        const centerX = (vectorA.x + vectorB.x) / 2;
        const centerY = (vectorA.y + vectorB.y) / 2;
        const centerZ = (vectorA.z + vectorB.z) / 2;

        // Create and return the center point as a new Vector3
        return new THREE.Vector3(centerX, centerY, centerZ);
    }
}