import { BodyPointer, BodyHandle } from "./BodyHandle";
import { MessageDispatcher } from "engine/MessageDispatcher";
import { GameplayMemory } from "engine/GameplayMemory";
import { LuaClientInterface } from "./LuaClientInterface";
import { EventHandler } from "../MODScript/EventHandler";
import { LMent } from "./LMent";
import { EventDefinition } from "MODScript/MODscriptDefs";
import { Helpers } from "./Helpers";
import { convertArray } from "./helpers/array";

type GamePreferences = {
  defaultPlayDifficulty: "normal" | "hardcore";
  avatarType: "Adventurer" | "Adventuress"
};

type GameStoryActors = {
  name: string;
  type: string;
}[];

export class GameplayScene {
  static _instance: GameplayScene;
  static get instance() {
    if (this._instance == undefined) {
      this._instance = new GameplayScene();
    }
    return this._instance;
  }

  bodies: BodyHandle[] = [];
  prefabs: BodyHandle[] = [];
  groups: { [key: number]: BodyHandle[] } = {};
  nextGroupId: number = -1;
  bodyIdMap: Map<number, BodyHandle> = new Map<number, BodyHandle>();
  dispatcher: MessageDispatcher = new MessageDispatcher(this);
  memory: GameplayMemory = new GameplayMemory();
  clientInterface: LuaClientInterface | undefined = undefined;
  currentDt: number = 0;
  eventHandler: EventHandler | undefined;
  gamePreferences: GamePreferences = {
    defaultPlayDifficulty: "normal",
    avatarType:"Adventurer"
  };
  story: EventDefinition[] = [];
  gameStoryActors: GameStoryActors | undefined = undefined;

  private constructor() {}

  setClientInterface(clientInterface: LuaClientInterface) {
    this.clientInterface = clientInterface;
  }

  setGamePreferences(preferences: GamePreferences) {
    this.gamePreferences = preferences;    
  }

  speak(...args: Parameters<LuaClientInterface["speak"]>) {
    this.clientInterface?.speak(...args);
  }

  setGameStory(story: EventDefinition[]) {
    this.story = convertArray(story) || [];
  }

  setGameStoryActors(actors: GameStoryActors | undefined) {
    this.gameStoryActors = convertArray(actors);
  }

  addBody(bodyNode: BodyPointer) {
    let handle = new BodyHandle(bodyNode);
    handle.isInScene = true;
    this.bodies.push(handle);
    this.bodyIdMap.set(bodyNode.id, handle);
    return handle;
  }

  addBodyToGroup(bodyId: number, groupId: number) {
    let body = this.getBodyById(bodyId);
    if (body !== undefined) {
      if (this.groups[groupId] === undefined) {
        this.groups[groupId] = [];
      }

      let group = this.groups[groupId];
      body.bodyGroup = group;
      group.push(body);
    }
  }

  createEmptyGroup() {
    let group: BodyHandle[] = [];
    let groupId = this.nextGroupId;
    this.groups[groupId] = group;
    this.nextGroupId--;
    return { id: groupId, group: group };
  }

  addPrefab(bodyNode: BodyPointer) {
    let handle = new BodyHandle(bodyNode);
    this.prefabs.push(handle);
    return handle;
  }

  getBodyById(id: number): BodyHandle | undefined {
    return this.bodyIdMap.get(id);
  }

  findAllElements<U extends LMent>(T: new (...args: any[]) => U): U[] {
    let elements: U[] = [];
    for (let body of this.bodies) {
      let bodyElements = body.getAllElements(T);
      elements.push(...bodyElements);
    }
    return elements;
  }

  clear() {
    this.bodies = [];
    this.bodyIdMap.clear();
    this.prefabs = [];
    this.groups = {};
    this.nextGroupId = -1;
    this.dispatcher.clearListeners();
  }

  initializeMemory(memoryOverride: Partial<GameplayMemory>) {
    this.memory = { ...new GameplayMemory(), ...memoryOverride };
    if (this.eventHandler) this.eventHandler.initialize();
  }

  preUpdate(dt: number) {
    this.memory.timeSinceStart += dt;
    this.currentDt = dt;
    for (let body of this.bodies) {
      body.initializeElements();
    }

    for (let body of this.bodies) {
      body.startElements();
    }

    this.dispatcher.updateFunctionQueue(dt);
  }

  update() {
    this.dispatcher.onUpdate(this.currentDt);
    if (!this.eventHandler) return;
    this.eventHandler.initCATs();
    this.eventHandler.onUpdate(this.currentDt);
  }

  cloneBody(body: BodyHandle): BodyHandle | undefined {
    let handle = body.body.cloneBody();
    if (handle !== undefined) {
      handle.initializeElements();
      return handle;
    }
    return undefined;
  }

  clonePrefab(prefabName: string) {
    for (let prefab of this.prefabs) {
      if (prefab.body.name == prefabName) {
        return this.cloneBody(prefab);
      }
    }
    return undefined;
  }

  destroyBody(body: BodyHandle) {
    let index = this.bodies.indexOf(body);
    if (index >= 0) {
      this.dispatcher.onActorDestroyed(body);
      this.dispatcher.removeAllListenersFromBody(body);

      this.bodies.splice(index, 1);

      if (body.bodyGroup.length > 1) {
        let group = body.bodyGroup;
        let groupIndex = group.indexOf(body);
        if (groupIndex >= 0) {
          group.splice(groupIndex, 1);
        }
      }
      body.body.destroyBody();
      body.isInScene = false;
    }

    //ASK DON: This should still be in the involvedActors to know when it gets destroyed, otherwise the OtherDestroyed trigger won't work.
    // if (this.eventHandler !== undefined)
    //   for (let e of this.eventHandler.events) {
    //     if (e.InvolvedActorIDs.includes(body.body.id))
    //       e.removeInvolvedActor(body);
    //   }
  }

  testErrorHandler() {
    console.log("test error");
    let foo: any = undefined;
    foo.bar();
    return 3;
  }
}
