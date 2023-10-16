import { BodyHandle } from "./BodyHandle";

// global variable declarations along with their default values.  Primitives and purely-primitive-valued objects can be overridden by gameplayScene.initialize().
// Non-primitives (such as GameplayMemory.player) should be overridden within element.onInit() where appropriate
export class GameplayMemory
{
  timeSinceStart = 0;
  player: BodyHandle | undefined = undefined;
}