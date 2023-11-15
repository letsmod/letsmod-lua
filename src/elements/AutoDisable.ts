import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { UpdateHandler } from "engine/MessageHandlers";

export class AutoDisable extends LMent implements UpdateHandler {
    disableDelay: number;
    targets: string[] | undefined;
    elementName: string;
    initiallyEnabled: boolean;
    private isDisabled: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoDisable> = {}) {
        super(body, id, params);
        this.disableDelay = params.disableDelay === undefined ? 0 : params.disableDelay;
        this.targets = this.convertArray(params.targets) || undefined;
        this.initiallyEnabled = params.initiallyEnabled === undefined ? true : params.initiallyEnabled;
        this.isDisabled = false;
        this.elementName = params.elementName === undefined ? "" : params.elementName;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        if (!this.initiallyEnabled) {
            this.enabled = false;
        }
    }

    onStart(): void {
    }

    onUpdate(dt: number): void {
        if (!this.isDisabled) {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDisable() }, this.disableDelay);
            this.isDisabled = true;
        }
    }

    doDisable() {
        if (this.targets !== undefined) {
            for (let i = this.body.bodyGroup.length; i > 0; i--) {
                const element = this.body.bodyGroup[i - 1].getElementByTypeName(this.elementName);
                if (element !== undefined)
                    element.enabled = false;

            }
        } else {
            const element = this.body.getElementByTypeName(this.elementName);
            if (element !== undefined)
                element.enabled = false;
        }
    }
}