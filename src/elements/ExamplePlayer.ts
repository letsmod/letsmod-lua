import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { ButtonHandler, DragGestureHandler } from "engine/MessageHandlers";

export class ExamplePlayer extends LMent implements ButtonHandler, DragGestureHandler
{
  constructor(body: BodyHandle, params: Partial<ExamplePlayer> = {})
  {
    super(body);
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("button", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    GameplayScene.instance.memory.player = this.body;
  }

  onStart(): void {
    
  }

  onButtonPress(button: string): void {
    if (button == "AButton")
    {
      let velocity = this.body.body.getVelocity();
      velocity.y += 10;
      this.body.body.setVelocity(velocity);
    }
  }

  onButtonHold(button: string): void {
    
  }

  onButtonRelease(button: string): void {
    
  }

  onDragStart(dx: number, dy: number): void {
    
  }

  onDrag(dx: number, dy: number): void {
    
  }

  onDragRelease(dx: number, dy: number): void {
    
  }

  hasSubtype(button: string): boolean {
    return button == "AButton";
  }
}