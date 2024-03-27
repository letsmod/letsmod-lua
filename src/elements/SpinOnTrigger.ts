import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { SfxPlayer } from "./SfxPlayer";

export class SpinOnTrigger extends LMent implements TriggerHandler, UpdateHandler {

    maxSpin: number;
    angularVelocity: Vector3;
    lockPosition: boolean;
    triggerId: string;
    sineValue: number;
    receivesTriggersWhenDisabled?: boolean | undefined;

    private _spin: number = 0;
    private startPosition: Vector3;
    private soundChip: SfxPlayer;

    //to be removed
    private isFinished: boolean = false;

    constructor(body: BodyHandle, id: number, params: Partial<SpinOnTrigger> = {}) {
        super(body, id, params);
        this.maxSpin = params.maxSpin === undefined ? 0 : params.maxSpin;
        this.lockPosition = params.lockPosition === undefined ? true : params.lockPosition;
        this.triggerId = params.triggerId ?? Helpers.NA;
        this.angularVelocity = params.angularVelocity ?? Helpers.NewVector3(0, 0, 0);
        this.startPosition = this.body.body.getPosition().clone();
        this.sineValue = params.sineValue ?? 0;
        this.soundChip = this.body.getElementByName("SpinInf") as SfxPlayer;
    }
    
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("trigger", this);
        GameplayScene.instance.dispatcher.addListener("update", this);
        if (this.lockPosition) {
            this.body.body.lockRotation(true, false, true);
        }
    }
    
    onStart(): void {
        this.soundChip = this.body.getElementByName("SpinInf") as SfxPlayer;
        this.startPosition = Helpers.NewVector3(this.startPosition.x, this.startPosition.y, this.startPosition.z);
        this.angularVelocity = Helpers.NewVector3(this.angularVelocity.x, this.angularVelocity.y, this.angularVelocity.z);
    }

    onUpdate(dt?: number | undefined): void {
        //to be removed
        if (!this.isFinished) {
            if (this._spin >= this.maxSpin) {

                // Sine wave effect mostly For removal as it is better to be a separate element
                const progress = Helpers.getInterpolatedProgress(GameplayScene.instance.memory.timeSinceStart / 1, "ease");
                const addedOffset = Helpers.NewVector3(0, this.sineValue, 0);
                const nextPosition = this.startPosition.clone().add(addedOffset.multiplyScalar(progress));
                this.body.body.setPosition(nextPosition);
                //end of sine wave effect

                this.body.body.setAngularVelocity(this.angularVelocity.clone().multiplyScalar(this.maxSpin));
                if (this.soundChip !== undefined)
                    this.soundChip.playAudio();
            }
            else {
                // Dampen angular velocity
                const currentAngularVelocity = this.body.body.getAngularVelocity();
                const dampedAngularVelocity = currentAngularVelocity.multiplyScalar(0.97);
                this.body.body.setAngularVelocity(dampedAngularVelocity);
                if (this.lockPosition)
                    this.body.body.setPosition(this.startPosition);
            }
        }
        else {
            this.body.body.setAngularVelocity(Helpers.NewVector3(0, 0, 0));
            this.body.body.setPosition(this.startPosition);
        }

    }

    validateElement(): boolean {
        return Helpers.ValidateParams(this.triggerId, this, "triggerId");
    }

    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (this._spin < this.maxSpin) {
            const AV = Helpers.NewVector3(0, 0, 0);
            AV.copy(this.angularVelocity.clone().multiplyScalar(this._spin + 1));
            AV.add(this.body.body.getAngularVelocity().clone());

            this.body.body.setAngularVelocity(AV);
            this.playAudio(this._spin);
            this._spin++;
            if (this._spin == this.maxSpin) {
                this.MaxSpinEffect();
            }
        }
    }
    //To be changed as its Hardcoded for those values
    playAudio(s: number) {
        const clientInterface = GameplayScene.instance.clientInterface;
        if (!clientInterface) return;
        switch (s) {
            case 0:
                clientInterface.playAudio("10fm/3_rotatingchicken/rotatingchicken_1", "rot1");
                break;
            case 4:
                clientInterface.stopAudio("rot1");
                clientInterface.playAudio("10fm/3_rotatingchicken/rotatingchicken_2", "rot2");
                break;
            case 8:
                clientInterface.stopAudio("rot2");
                clientInterface.playAudio("10fm/3_rotatingchicken/rotatingchicken_3", "rot3");
                break;
            case 12:
                clientInterface.stopAudio("rot3");
                clientInterface.playAudio("10fm/3_rotatingchicken/rotatingchicken_4", "rot4");
                break;
            case 14: clientInterface.stopAudio("rot4");
        }
    }
    //To be removed as it casts a trigger i wasnt sure about implementing it 
    MaxSpinEffect(): void {
        if (Helpers.ValidateParams(this.triggerId, this, "triggerId")) {
            GameplayScene.instance.dispatcher.onTrigger(this, this.triggerId, "global");
        }
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.RestAfterSpin() }, 28);
    }

    //To be removed very specific case
    RestAfterSpin(): void {
        if (Helpers.ValidateParams("Rest", this, "triggerId")) {
            GameplayScene.instance.dispatcher.onTrigger(this, "Rest", "global");
        }
        this.soundChip.stopAudio();
        this.isFinished = true;
        this.body.body.setRotation(Helpers.NewQuatFromEuler(Math.PI * 1.5, Math.PI / 2, -Math.PI / 2))
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.Victory() }, 2)
    }
    
    Victory(): void {
        GameplayScene.instance.clientInterface?.winMod();

    }
}