import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Utils3D } from '../utils_3d';

export class UR3Robot {
    /**
     * Constructor for initializing the ∂class
     *
     * @param {type} assetPath - path of the glb file
     * @param {type} gui - instance of DAT GUI
     * @param {type} onModelLoaded - callback with the model
     */
    constructor(assetPath, gui, scene, onModelLoaded) {
        this.assetPath = assetPath
        this.gui = gui;
        this.scene = scene
        this.loader = new GLTFLoader()
        this._onModelLoaded = onModelLoaded;
        this._hitboxColor = 0xffffff
        this._hitboxColorTouched = 0xff0000;
        this._showHitbox = false;
        this._showRobot = true;
        this._showLinkChain = true
        this._rotations = { 'link0': 0, 'link1': 0, 'link2': 0, 'link3': 0, 'link4': 0, 'link5': 0 }
        this._setup();
    }

    /*
    ************************************* 
    PUBLIC API
    *************************************
    */
    move(th1, th2, th3, th4, th5, th6) {
        // TODO: Sync with links
        this.joint1.rotation.y = th1
        this.joint2.rotation.y = th2
        this.joint3.rotation.y = th3
        this.joint4.rotation.y = th4
        this.joint5.rotation.y = th5
        this.joint6.rotation.y = th6
    }

    toggleHitboxVisibility() {
        this._showHitbox = !this._showHitbox
        this.baseHitbox.visible = this._showHitbox
        this.elbowHitbox.visible = this._showHitbox
        this.wristHitbox.visible = this._showHitbox
        this.wrist2Hitbox.visible = this._showHitbox
        this.wrist3Hitbox.visible = this._showHitbox
    }

    toggleRobotVisibility() {
        this._showRobot = !this._showRobot
        this.UR3.visible = this._showRobot
    }

    toggleLinkChainVisibility() {
        this._showLinkChain = !this._showLinkChain
        this.link0.visible = this._showLinkChain
    }

    calculateCollisions(scene) {
        // TODO
    }



    /*
    ************************************* 
    PRIVATE METHODS 
    *************************************
    */
    _setup() {
        this.loader.load(this.assetPath, (object) => {
            this.robot = object.scene;
            // Access the UR3 object after it's loaded
            this.UR3 = this.robot.getObjectByName("UR3");
            this.joint1 = this.UR3.getObjectByName("Joint_1");
            this.joint2 = this.UR3.getObjectByName("Joint_2");
            this.joint3 = this.UR3.getObjectByName("Joint_3");
            this.joint4 = this.UR3.getObjectByName("Joint_4");
            this.joint5 = this.UR3.getObjectByName("Joint_5");
            this.joint6 = this.UR3.getObjectByName("Joint_6");
            this.UR3.visible = this._showRobot

            // Draw the line diagram
            this._setupLineDiagram()

            // Inform the listener
            this._onModelLoaded(this.robot);

            // Add the ui
            let movement = this.gui.addFolder("Movement")
            movement.open()
            movement.add(this.joint1.rotation, 'y', -Math.PI, Math.PI).name("Base").onChange((value) => {
                this.link0.rotation.y = value
            })
            movement.add(this.joint2.rotation, 'y', -Math.PI, Math.PI).name("Shoulder").onChange((value) => {
                // The value is the new rotation, not the ADDED
                let delta = value - this._rotations['link1']
                this._rotations['link1'] = value
                Utils3D.rotateAboutPoint(this.link1_1, this.axis1Pivot, this.axis1, -delta, false)
            })
            movement.add(this.joint3.rotation, 'y', -Math.PI, Math.PI).name("Elbow").onChange((value) => {
                let delta = value - this._rotations['link2']
                this._rotations['link2'] = value
                Utils3D.rotateAboutPoint(this.link2, this.axis2Pivot, this.axis2, delta, false)
            })
            movement.add(this.joint4.rotation, 'y', -Math.PI, Math.PI).name("Wrist_1").onChange((value) => {
                let delta = value - this._rotations['link3']
                this._rotations['link3'] = value
                Utils3D.rotateAboutPoint(this.link3, this.axis3Pivot, this.axis3, -delta, false)
            })
            movement.add(this.joint5.rotation, 'y', -Math.PI, Math.PI).name("Wrist_2").onChange((value) => {
                let delta = value - this._rotations['link4']
                this._rotations['link4'] = value
                Utils3D.rotateAboutPoint(this.link4, this.axis4Pivot, this.axis4, -delta, false)
            })
            movement.add(this.joint6.rotation, 'y', -Math.PI, Math.PI).name("Wrist_3").onChange((value) => {
                let delta = value - this._rotations['link5']
                this._rotations['link5'] = value
                Utils3D.rotateAboutPoint(this.link5, this.axis5Pivot, this.axis5, -delta, false)
            })
        }, (xhr) => {
            //console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        }, (error) => {
            console.log(error);
        })


    }

    _setupLineDiagram() {
        const lineColor = 0xff0000;
        const lineThickness = 0.003;
        // Definitions of dimensions of UR3
        const d0 = 0.15185
        const a1 = 0.24365
        const a2 = 0.21325
        const d4 = 0.11235
        const d3 = 0.08535
        const d5 = 0.0819
        // The kinematics don't need the offset, but it fits the robot geometry
        const link1Offset = 0.12
        const link1OffsetTop = 0.093
        // For ease of use, we are going to define the points here
        // The origin point of the next link is the end of the previous
        const link0_origin = vector3(0, 0, 0)
        const link0_end = vector3(0, d0, 0)
        const link1_1_end = vector3(link1Offset, d0, 0)
        const link1_2_end = vector3(link1Offset, d0, a1)
        const link1_3_end = vector3(link1Offset - link1OffsetTop, d0, a1)
        const link2_end = vector3(link1Offset - link1OffsetTop, d0, a1 + a2)
        const link3_end = vector3(link1Offset - link1OffsetTop + d3, d0, a1 + a2)
        const link4_end = vector3(link1Offset - link1OffsetTop + d3, d0 - d3, a1 + a2)
        const link5_end = vector3(link1Offset - link1OffsetTop + d3 + d5, d0 - d3, a1 + a2)
        // Add all the links as class parameters
        this.link0_origin = link0_origin
        this.link0_end = link0_end
        this.link1_1_end = link1_1_end
        this.link1_2_end = link1_2_end
        this.link1_3_end = link1_3_end
        this.link2_end = link2_end
        this.link3_end = link3_end
        this.link4_end = link4_end
        this.link5_end = link5_end

        // Definition of links
        this.link0 = Utils3D.createLine(link0_origin, link0_end, lineColor, lineThickness);
        this.scene.add(this.link0)

        this.link1_1 = Utils3D.createLine(link0_end, link1_1_end, lineColor, lineThickness);
        this.link0.add(this.link1_1)
        this.link1_2 = Utils3D.createLine(link1_1_end, link1_2_end, lineColor, lineThickness);
        this.link1_1.add(this.link1_2)
        this.link1_3 = Utils3D.createLine(link1_2_end, link1_3_end, lineColor, lineThickness);
        this.link1_2.add(this.link1_3)
        this.axis1 = new THREE.Vector3().subVectors(link0_end, link1_1_end).normalize();
        this.axis1Pivot = link0_end

        this.link2 = Utils3D.createLine(link1_3_end, link2_end, lineColor, lineThickness);
        this.link1_3.add(this.link2)
        this.axis2 = new THREE.Vector3().subVectors(link1_2_end, link1_3_end).normalize();
        this.axis2Pivot = link1_3_end

        this.link3 = Utils3D.createLine(link2_end, link3_end, lineColor, lineThickness);
        this.link2.add(this.link3)
        this.axis3 = new THREE.Vector3().subVectors(link2_end, link3_end).normalize();
        this.axis3Pivot = link2_end

        this.link4 = Utils3D.createLine(link3_end, link4_end, lineColor, lineThickness);
        this.link3.add(this.link4)
        this.axis4 = new THREE.Vector3().subVectors(link3_end, link4_end).normalize();
        this.axis4Pivot = link3_end

        this.link5 = Utils3D.createLine(link4_end, link5_end, lineColor, lineThickness);
        this.link4.add(this.link5)
        this.axis5 = new THREE.Vector3().subVectors(link4_end, link5_end).normalize();
        this.axis5Pivot = link4_end

        // PROVISIONAL, JUST TO CHECK THAT IT ROTATES
        let cube = Utils3D.createBox(0.02, 0.02, 0.02, 0x000000, true)
        const translation = new THREE.Vector3().subVectors(link5_end, cube.position);
        cube.position.add(translation)
        this.link5.add(cube)

        this._setupHitbox()
        this.link0.visible = this._showLinkChain;

    }

    _setupHitbox() {
        // Helper func

        // Add hitboxes
        const baseSizeX = .11
        const baseSizeY = .22
        const baseSizeZ = .13
        this.baseHitbox = Utils3D.createBox(baseSizeX, baseSizeY, baseSizeZ, this._hitboxColor)
        this.baseHitbox.translateY(baseSizeY / 2)
        this.link0.add(this.baseHitbox)


        const elbowSizeX = .115
        const elbowSizeY = .395
        const elbowSizeZ = .095
        this.elbowHitbox = Utils3D.createBox(elbowSizeX, elbowSizeY, elbowSizeZ, this._hitboxColor)
        this.elbowHitbox.rotateX(Math.PI / 2)
        let elbowTranslation = new THREE.Vector3().subVectors(
            Utils3D.findCenterPoint(this.link1_1_end, this.link1_2_end),
            this.elbowHitbox.position)
        this.elbowHitbox.position.add(elbowTranslation)
        this.link1_1.add(this.elbowHitbox)

        const wristSizeX = .095
        const wristSizeY = .09
        const wristSizeZ = .29
        this.wristHitbox = Utils3D.createBox(wristSizeX, wristSizeY, wristSizeZ, this._hitboxColor)
        let wristTranslation = new THREE.Vector3().subVectors(
            Utils3D.findCenterPoint(this.link1_3_end, this.link2_end),
            this.wristHitbox.position)
        this.wristHitbox.position.add(wristTranslation)
        this.link2.add(this.wristHitbox)



        const wrist2SizeX = .08
        const wrist2SizeY = .168
        const wrist2SizeZ = .095
        this.wrist2Hitbox = Utils3D.createBox(wrist2SizeX, wrist2SizeY, wrist2SizeZ, this._hitboxColor)
        let wrist2Translation = new THREE.Vector3().subVectors(
            Utils3D.findCenterPoint(this.link3_end, this.link4_end),
            this.wrist2Hitbox.position
        )
        this.wrist2Hitbox.position.add(wrist2Translation)
        this.wrist2Hitbox.translateY(0.005)
        this.link4.add(this.wrist2Hitbox)

        const wrist3SizeX = .08
        const wrist3SizeY = .085
        const wrist3SizeZ = .13
        this.wrist3Hitbox = Utils3D.createBox(wrist3SizeX, wrist3SizeY, wrist3SizeZ, this._hitboxColor)
        this.wrist3Hitbox.translateZ(-.015)
        this.wrist3Hitbox.translateY(0.01)
        //this.joint5.add(this.wrist3Hitbox)

        // Add hitbox controls to ui
        const hitboxFolder = this.gui.addFolder("Hitboxes")


        const hitboxParams = { 'visibility': this._showHitbox, 'robot': this._showRobot, 'line': this._showLinkChain } // DAT GUI things, we need to create an object
        hitboxFolder.add(hitboxParams, 'visibility').name("Show Hitboxes").onChange(() => {
            this.toggleHitboxVisibility()
        })
        hitboxFolder.add(hitboxParams, 'robot').name("Show Robot").onChange(() => {
            this.toggleRobotVisibility()
        })
        hitboxFolder.add(hitboxParams, 'line').name("Show line chain").onChange(() => {
            this.toggleLinkChainVisibility()
        })
        hitboxFolder.add
        hitboxFolder.open()
    }


}

// This is just faster to write than new THREE.Vector3(x, y, z)
function vector3(x, y, z) {
    return new THREE.Vector3(x, y, z)
}
