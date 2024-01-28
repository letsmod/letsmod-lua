import { EventHandler } from "MODScript/EventHandler";
import { ActionFactory } from "MODScript/FactoryClasses/ActionsFactory";
import { ActionDefinition, CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class SimultaneousAction extends GenericAction {

    action1: ActionDefinition | undefined;
    action2: ActionDefinition | undefined
    genericAction1: GenericAction | undefined;
    genericAction2: GenericAction | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<SimultaneousAction>) {
        super(parentEvent);
        if (args.action1)
            this.action1 = args.action1;
        if (args.action2)
            this.action2 = args.action2;

        if (this.action1) {
            if (this.isValidAction(this.action1.actionType))
                this.genericAction1 = ActionFactory.createAction(this.parentEvent, this.action1);
        }
        if (this.action2)
            this.genericAction2 = ActionFactory.createAction(this.parentEvent, this.action2);
    }

    isValidAction(actionType: string): boolean {
        return actionType === CATs.SimultaneousActions || actionType === CATs.WaitAction || actionType === CATs.Say;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {

        if(!this.genericAction1 || !this.genericAction2) 
        {
            this.actionFailed();
            return;
        }
        
        if (this.genericAction1.actionType === CATs.Say || this.genericAction1.actionType === CATs.WaitAction) {
            this.genericAction1.performAction();
            if (this.genericAction1.ActionIsFinished)
                this.genericAction2.performAction(triggerOutput);
        }
        else this.genericAction2.performAction(triggerOutput);
    }

    monitorAction(): void {
        if (this.genericAction1?.ActionIsFinished && this.genericAction2?.ActionIsFinished)
            this.actionFinished();
    }
}