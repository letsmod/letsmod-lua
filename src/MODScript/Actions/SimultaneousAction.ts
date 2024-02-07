import { EventHandler } from "MODScript/EventHandler";
import { ActionFactory } from "MODScript/FactoryClasses/ActionsFactory";
import { ActionDefinition, CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class SimultaneousAction extends GenericAction {

    genericAction1: GenericAction | undefined;
    genericAction2: GenericAction | undefined;

    action1Performed: boolean = false;
    action2Performed: boolean = false;

    triggerOutput: BodyHandle | undefined;

    constructor(parentEvent: MODscriptEvent, action1: GenericAction | undefined, action2: GenericAction | undefined) {
        super(parentEvent, CATs.SimultaneousActions);

        if (!action1 || !action2) return;

        this.genericAction1 = action1;
        this.genericAction2 = action2;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {

        if (!this.genericAction1 || !this.genericAction2) {
            this.actionFailed();
            return;
        }
        this.triggerOutput = triggerOutput;
        if (this.genericAction1.actionType === CATs.Say || this.genericAction1.actionType === CATs.Wait) {
            this.genericAction1.performAction(triggerOutput);
        }
        else this.genericAction2.performAction(triggerOutput);
    }

    monitorAction(): void {

        if (!this.genericAction1 || !this.genericAction2) {
            this.actionFailed();
            return;
        }

        if (this.genericAction1.ActionIsFinished)
            this.genericAction2.performAction(this.triggerOutput);

        if (this.genericAction1.ActionIsFinished && this.genericAction2.ActionIsFinished)
            this.actionFinished();
    }
}