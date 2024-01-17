import { BodyPointer, BodyHandle } from "./BodyHandle";
import { MessageDispatcher } from "engine/MessageDispatcher";
import { GameplayMemory } from "engine/GameplayMemory";
import { LuaClientInterface } from "./LuaClientInterface";
import { EventHandler } from "../MODScript/EventHandler";

type GamePreferences = {
  defaultPlayDifficulty: "normal" | "hardcore";
};

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
  gamePreferences: GamePreferences = {
    defaultPlayDifficulty: "normal",
  };

  private constructor() {


  }

  setClientInterface(clientInterface: LuaClientInterface) {
    this.clientInterface = clientInterface;
  }
  setGamePreferences(preferences: GamePreferences) {
    this.gamePreferences = preferences;
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
    EventHandler.initialize();
    this.dispatcher.updateFunctionQueue(dt);
  }

  update() {
    this.dispatcher.onUpdate(this.currentDt);
    EventHandler.instance.onUpdate(this.currentDt);
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
  }

  testErrorHandler() {
    console.log("test error");
    let foo: any = undefined;
    foo.bar();
    return 3;
  }
}
