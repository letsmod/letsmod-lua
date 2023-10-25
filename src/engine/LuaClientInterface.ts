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
}