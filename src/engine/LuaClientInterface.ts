import { BodyHandle } from "./BodyHandle";

export interface LuaClientInterface
{
  // starts (or unpauses) the game's timer
  startTimer() : void;

  // restarts the game's timer
  resetTimer() : void;

  // pauses the game's timer
  pauseTimer() : void;

  // adds value to the games's current score and saves the new value
  addScore(value : number) : void;

  // plays the audio file with the given name, returns an instance slot id which can be used to stop the audio
  // instanceSlotId may be specified to use a specific slot, otherwise a random slot will be chosen
  playAudio(name : string, instanceSlotId? : string) : string;

  // stops the audio in the given slot
  stopAudio(instanceSlotId: string) : void;

  // changes the active camera to the camera with the given body id, if it exists
  setCamera(cameraBodyId: number) : void;

  // causes the user to win the game
  winMod() : void;

  // causes the user to lose the game
  loseMod() : void;

  // returns a pseudorandom number between 0 and 1.
  // each element will always produce the same sequence of numbers each time the mod restarts.
  nextRandomNumberForElement(elementId: number) : number;

  // raycasts in the scene from the origin, in the direction, and returns information about the first object hit
  raycast(origin: THREE.Vector3, direction: THREE.Vector3, excludeId?: number, requireVisible?: boolean) :
    {
      name: string | undefined,
      body: BodyHandle | undefined,
      point: THREE.Vector3 | undefined,
      normal: THREE.Vector3 | undefined,
      distance: number
    };
}