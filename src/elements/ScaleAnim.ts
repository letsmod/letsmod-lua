import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";

export class ScaleAnim extends LMent implements UpdateHandler {

    style: string;
    maxScale: number;
    minScale: number;
    speed: number;
    speedRandomFactror: number;
    startShrinking: boolean;
    initiallyEnabled: boolean;
    private speedRandom: number;

    constructor(body: BodyHandle, id: number, params: Partial<ScaleAnim> = {}) {
        super(body, id, params);
        this.style = params.style === undefined ? "linear" : params.style;
        this.maxScale = params.maxScale === undefined ? 1 : params.maxScale;
        this.minScale = params.minScale === undefined ? 0 : params.minScale;
        this.speed = params.speed === undefined ? 1 : params.speed;
        this.speedRandomFactror = params.speedRandomFactror === undefined ? 0 : params.speedRandomFactror;
        this.startShrinking = params.startShrinking === undefined ? false : params.startShrinking;
        this.initiallyEnabled = params.initiallyEnabled === undefined ? true : params.initiallyEnabled;
        this.speedRandom = 0;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        if (!this.initiallyEnabled) {
            this.enabled = false;
        }
        if (this.startShrinking) {
            this.body.body.setScale(Helpers.NewVector3(this.maxScale, this.maxScale, this.maxScale));
            let temp = this.maxScale;
            this.maxScale = this.minScale;
            this.minScale = temp;
        }
        else(
            this.body.body.setScale(Helpers.NewVector3(this.minScale, this.minScale, this.minScale))
        )
    }
    
    onStart(): void {

    }

    onUpdate(dt: number): void {
        if(Math.random() > 0.5)
            this.speedRandomFactror = -this.speedRandomFactror;
        this.speedRandom = this.speed + Math.random() * this.speedRandomFactror;
        switch (this.style) {
            case "sine": this.sineAnim(dt);
                break;
            case "linear": this.linearAnim(dt);
                break;
            default:
                break;
        }
    }

    sineAnim(dt: number): void {
        let sineValue = (Math.sin(GameplayScene.instance.memory.timeSinceStart * this.speed) + 1) / 2;
        sineValue = sineValue * (this.maxScale - this.minScale) + this.minScale;
        let scaleVector = Helpers.NewVector3(sineValue, sineValue, sineValue);
        this.body.body.setScale(scaleVector);
    }

    linearAnim(dt: number): void {
        let scale= this.body.body.getScale().x;
        if(this.startShrinking){
            if(scale !== undefined && scale <= this.maxScale)
            return;
            scale = this.body.body.getScale().x - (0.01 * this.speedRandom);
        }else{
            if(scale !== undefined && scale >= this.maxScale)
            return;
            scale = this.body.body.getScale().x + (0.01 * this.speedRandom);
        }
        let scaleVector = Helpers.NewVector3(scale, scale, scale);
        this.body.body.setScale(scaleVector);
    }


}