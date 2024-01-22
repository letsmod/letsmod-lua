import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";

import {
    ButtonHandler, CollisionHandler,
    CollisionInfo, PhysicsSubstepHandler,
    UpdateHandler, HandlerKey,
    ActorDestructionHandler,
    HitPointChangeHandler
} from "engine/MessageHandlers";

import { HitPoints, DamageType } from "./HitPoints";
import { PrefabSpawner } from "./PrefabSpawner";
import { Vector3 } from "three";
import { HazardZone } from "./HazardZone";

import { CameraTarget } from "./CameraTarget";
import { VisibilityFlicker } from "./VisibilityFlicker";
import { ScaleWaypoint } from "./ScaleWaypoint";
import { GuideBody } from "./GuideBody";
import { SfxPlayer } from "./SfxPlayer";
import { AvatarBase } from "./AvatarBase";
import { BouncerEnemy } from "./BouncerEnemy";
import { ContactDamage } from "./ContactDamage";

// const Constants = {
//     /*** Engine Constants ***/
//     AButton: "AButton",
//     BButton: "BButton",

//     /*** Common Constants ****/
//     Player: "player",
//     MainCamera: "MainCamera_Lua",
//     RollerballGuide: "RollerCamGuide_Lua",
//     DifficultyHard: "hardcore",
//     Male: "male",
//     Female: "female",
//     FemaleAvatarSuffix: " Girl",

//     /*** Avatar Prefabs ***/
//     WingSuitAvatar: "Wingsuit",
//     SlingshotAvatar: "Slingshot",
//     RollerballAvatar: "Rollerball",
//     BaseAvatar: "Player",

//     /*** Equipment ***/
//     BaseEquip: "base",
//     RollerBallEquip: "rollerball",
//     SlingshotEquip: "slingshot",
//     WingSuitEquip: "wingsuit",

//     /*** Audio Constants ***/
//     DeathAudio: "Death",

const EasingFunctions = {
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => t * (2 - t),
    'ease-in-out': (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    'linear': (t: number) => t // For no easing, linear progression
};



export class ParticlesDeath extends LMent implements UpdateHandler, CollisionHandler, PhysicsSubstepHandler, ButtonHandler {

    easingType: string = 'ease-in-out';
    rotationSpeed: number = 0;
    particleForce: number = 0;
    particleScaleAvg: number = 0;
    gravity: number = 0;
    particleObject = "Beveled cube body";

    // New properties for rotation
    private jumpTimer: number = 0;
    private rotateActive: boolean = false;
    private totalRotation: number = 0;
    private currentPosition: THREE.Vector3;
    private rotateAxis: THREE.Vector3 = Helpers.NewVector3(1, 0, 0);
    private initRotateAxis: THREE.Vector3 = Helpers.NewVector3(1, 0, 0);
    private currentRotation: THREE.Quaternion;
    private isRotating: boolean = false;
    private currentParticleOpacity: number = 0;
    private particleActive: boolean = false;
    private currentParticleScale: number = 1;
    private allParticlesArray: number[] = [];
    private isActivelyRotating: boolean = false;
    


    constructor(body: BodyHandle, id: number, params: Partial<ParticlesDeath> = {}) {
        super(body, id, params);
        
        this.rotationSpeed = params.rotationSpeed === undefined ? 500 : params.rotationSpeed;
        this.currentPosition = body.body.getPosition().clone();
        this.currentRotation = body.body.getRotation().clone();

        this.easingType = "ease-in-out";
        this.particleForce = params.particleForce === undefined ? 500 : params.particleForce;
        this.particleScaleAvg = params.particleScaleAvg === undefined ? 0.5 : params.particleScaleAvg;
        this.gravity = params.gravity === undefined ? 0.1 : params.gravity;
        this.particleObject = params.particleObject === undefined ? "Beveled cube body" : params.particleObject;

        this.currentParticleOpacity = 1;
        this.particleActive = false;
        this.currentParticleScale = 1;

        this.allParticlesArray = [];
        this.isActivelyRotating = false;
    
    }


    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("collision", this);
        GameplayScene.instance.dispatcher.addListener("button", this);
    }


    onButtonPress(button: string): void {
        // console.log("button pressed: ", button);

        if (button === 'BButton') {
            // console.log("enter pressed");
            // console.log("body id: ", this.body);

            // this.startDeathAnimation();
        }
    }
    

    deathAnim(dt: number) {
        // console.log("death anim", this.body);

        this.totalRotation += dt * 12;

        let normalizedTime = this.totalRotation / (Math.PI / 2);

        let easeInProgress = normalizedTime * normalizedTime;

        let rotationAmount = easeInProgress * (Math.PI / 2);

        // console.log("total rotation", this.totalRotation);

        if (this.totalRotation >= Math.PI/2) {
            
            this.body.body.setRotation(this.currentRotation);

            this.totalRotation = 0;
            this.rotateActive = false;
            this.isRotating = false;
            this.currentParticleOpacity = 0;
            
            // console.log("rotation complete");

            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.particleDeath() }, 2);

        } else {

            let quat = Helpers.NewQuaternion();
            quat.setFromAxisAngle(this.rotateAxis, rotationAmount);
            this.body.body.applyRotation(quat);
            

            // console.log("rotation", rotationAmount);

            this.currentRotation = this.body.body.getRotation().clone();
        }

        // GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.body.body.setVisible(false); }, scaleanim.points[0].duration + scaleanim.points[0].delay);

    }

    handleSingleParticle(particle: BodyHandle) {

        if (!particle) return;

        let sphere = GameplayScene.instance.cloneBody(particle);

        if (sphere) {

            let x = Math.random() * 2 - 1;
            let y = Math.random() * 2 - 1;
            let z = Math.random() * 2 - 1;


            let position = this.body.body.getPosition().clone();
            // console.log("position: ", position);
            let offset = Helpers.NewVector3(x, y, z);
            // console.log("offset: ", offset);
            offset.multiplyScalar(0.5);

            sphere.body.setPosition(position.add(offset));

            let scale = Math.random() * this.particleScaleAvg + this.particleScaleAvg;
            // console.log("scale: ", scale);
            sphere.body.setScale(Helpers.NewVector3(scale, scale, scale));

            let angle = Math.random() * Math.PI * 2;
            // console.log("angle: ", angle);
            let direction = Helpers.NewVector3(Math.cos(angle), Math.sin(angle), 1);

            let speed = Math.random() * this.particleForce;
            // console.log("speed: ", speed);
            let velocity = direction.multiplyScalar(speed);
            sphere.body.setVelocity(velocity);

            // GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.particleActive = true; }, 2);
            
            this.particleActive = true;

            // return the id of the sphere
            return Number(sphere.body.id);
        }
    }

    particleTemporalScale(particleArray: number[]) {

        // console.log("runnign particle temporal scale");


        // print the length of the array
        // console.log("particle id length: ", particleArray.length);

        for (let i = 0; i < particleArray.length; i++) {
            let particle = GameplayScene.instance.getBodyById(Number(particleArray[i]));
            // console.log("particle: ", particle);
            
            if (particle) {
                let particleScale = particle.body.getScale().clone();
                // console.log("particle scale: ", particleScale);
                particleScale.multiplyScalar(0.80);
                particle.body.setScale(particleScale);
            }
        }
    }

    particleDeath() {
        // this.body.body.setVisible(false);
    
        // let particle = GameplayScene.instance.getBodyById(25050);
        // let particle = Helpers.findBodyInScene("Sphere body");
        let particle = Helpers.findBodyInScene(this.particleObject);

        // console.log("particle: ", particle);

        this.particleActive = true;


    
        if (particle) {
            for (let i = 0; i < 40; i++) {
                let particleId = this.handleSingleParticle(particle);
                this.allParticlesArray.push(particleId || 0);
            }
        }

        // console.log("all particles array: ", this.allParticlesArray);

  
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.particleActive = false; }, 2);


    }


    onUpdate(dt?: number | undefined): void {
        this.body.body.setAngularVelocity(Helpers.zeroVector);

        if (this.rotateActive) {
            this.deathAnim(dt || 0);
        }

        if (this.particleActive) {
            this.particleTemporalScale(this.allParticlesArray);

            let scale = this.body.body.getScale().clone();
            scale.multiplyScalar(0.70);
            this.body.body.setScale(scale);
        }

        // if (this.particleActive) {
        //     let scale = this.body.body.getScale().clone();
        //     scale.multiplyScalar(0.80);
        //     this.body.body.setScale(scale);
        // }

    }



    startDeathAnimation() {
        this.rotateActive = true;
        this.isRotating = true;
        this.totalRotation = 0;
        this.currentPosition = this.body.body.getPosition().clone();
        this.currentRotation = this.body.body.getRotation().clone();
    }


    onButtonHold(): void {

    }

    onButtonRelease(): void {

    }


    hasSubtype(): boolean {
        return false;
    }


    onCollision(info: CollisionInfo): void {

        let otherId = info.getOtherObjectId();
        // console.log("other id: ", otherId);

        let this_body_id = this.body.body.id;
        // console.log("this body id: ", this_body_id);

        let touch_point = info.getContactPointOnSelf();
        // console.log("touch point y: ", touch_point.y);
        // console.log("touch point x: ", touch_point.x);

        // using ContactDamage check if player dies
        let otherBody = GameplayScene.instance.getBodyById(otherId);
        let contactDamage = otherBody?.getElement(ContactDamage);


        // current health of player
        let hpElement = this.body.getElement(HitPoints);
        let currentHealth = hpElement?.hitpoints ?? 0;
        // console.log("current health: ", currentHealth);

        if (this.isActivelyRotating === false) {
            if (currentHealth <= 0) {
                // console.log("player is dead");
                this.startDeathAnimation();
                this.isActivelyRotating = true;
                // GameplayScene.instance.clientInterface?.loseMod();
            }
        } else {
            // console.log("player is already dead");
        }

    }


    onSpaceBarPress(): void {

    }


    onPhysicsSubstep(substepDt?: number): void {

    }


    onStart(): void {

    }



}
