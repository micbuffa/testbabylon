import { ActionManager, Color3, Color4, FreeCamera, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";

import floorUrl from "../assets/textures/floor.png";
import floorBumpUrl from "../assets/textures/floor_bump.png";

class Game {

    #canvas;
    #engine;
    #gameScene;

    #sphere;

    #phase = 0.0;
    #vitesseY = 0.0018;

    inputMap = {};
    actions = {};

    constructor(canvas, engine) {
        this.#canvas = canvas;
        this.#engine = engine;
    }

    start() {
        this.initGame()
        this.gameLoop();
        this.endGame();
    }

    createScene() {
        const scene = new Scene(this.#engine);
        const camera = new FreeCamera("camera1", new Vector3(0, 18, -35), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this.#canvas, true);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const sLight = new SpotLight("spot1", new Vector3(0, 20, 20), new Vector3(0, -1, -1), 1.2, 24, scene);
        const shadowGenerator = new ShadowGenerator(1024, sLight);
        shadowGenerator.useBlurExponentialShadowMap = true;

        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
        sphere.position.y = 5;
        this.#sphere = sphere;

        const ground = MeshBuilder.CreateGround("ground", { width: 64, height: 64 }, scene);

        const matGround = new StandardMaterial("boue", scene);
        //matGround.diffuseColor = new Color3(1, 0.4, 0);
        matGround.diffuseTexture = new Texture(floorUrl);
        matGround.bumpTexture = new Texture(floorBumpUrl);

        ground.material = matGround;
        ground.receiveShadows = true;

        const matSphere = new StandardMaterial("silver", scene);
        matSphere.diffuseColor = new Color3(0.8, 0.8, 1);
        matSphere.specularColor = new Color3(0.4, 0.4, 1);
        sphere.material = matSphere;

        shadowGenerator.addShadowCaster(sphere);

        sphere.actionManager = new ActionManager(scene);
        sphere.actionManager.registerAction(
            new InterpolateValueAction(
                ActionManager.OnPickTrigger,
                light,
                'diffuse',
                Color3.Black(),
                1000
            )
        );



        return scene;
    }

    initGame() {
        this.#gameScene = this.createScene();
        this.initInput();
    }

    initInput() {
        this.#gameScene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.code] = true;
                    console.log(`KEY DOWN: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.code] = false;
                    this.actions[kbInfo.event.code] = true;
                    console.log(`KEY UP: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                    break;
            }
        });
    }

    endGame() {

    }

    gameLoop() {

        const divFps = document.getElementById("fps");
        this.#engine.runRenderLoop(() => {

            this.updateGame();

            this.actions = {};

            divFps.innerHTML = this.#engine.getFps().toFixed() + " fps";
            this.#gameScene.render();
        });
    }

    updateGame() {

        let delta = this.#engine.getDeltaTime();

        this.#phase += this.#vitesseY * delta;
        this.#sphere.position.y = 2 + Math.sin(this.#phase);
        this.#sphere.scaling.y = 1 + 0.125*Math.sin(this.#phase);

        if (this.inputMap["KeyA"] && this.#sphere.position.x > -30)
            this.#sphere.position.x -= 0.01 * delta;
        else if (this.inputMap["KeyD"]  && this.#sphere.position.x < 30)
            this.#sphere.position.x += 0.01 * delta;

        if (this.inputMap["KeyW"] && this.#sphere.position.z < 30)
            this.#sphere.position.z += 0.01 * delta;
        else if (this.inputMap["KeyS"]  && this.#sphere.position.z > -30)
            this.#sphere.position.z -= 0.01 * delta;

        if (this.actions["Space"])
            this.#vitesseY *= 1.25;
    }
}

export default Game;