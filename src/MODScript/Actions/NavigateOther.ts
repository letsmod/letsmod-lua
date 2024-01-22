import { GenericAction} from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { MODscriptStates } from "elements/MODScript States/MODscriptStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class NavigateOther extends GenericAction {
    speed: number;
    actorId: number;

    constructor(parentEvent: MODscriptEvent, args: Partial<NavigateOther>) {
        super(parentEvent);
        this.actorId = args.actorId ?? 0;
        this.speed = args.speed ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        const actor = GameplayScene.instance.getBodyById(this.actorId);
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.stateMachine||!actor ) return;

        this.parentEvent.stateMachine.startState(this.ActionId, MODscriptStates.navigate, actor.body.getPosition(), actor.body.getPosition());
        if(this.parentEvent.stateMachine.stateIsComplete(this.ActionId))
            this.actionFinished();
        else if(this.parentEvent.stateMachine.stateIsFailed(this.ActionId))
            this.actionFailed();
    }

    actionFinishedCallback(): void {
    }

    actionFailedCallback(): void {

    }
}