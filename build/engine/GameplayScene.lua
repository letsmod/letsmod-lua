local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local Map = ____lualib.Map
local __TS__New = ____lualib.__TS__New
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ObjectDefineProperty = ____lualib.__TS__ObjectDefineProperty
local ____exports = {}
local ____BodyHandle = require("engine.BodyHandle")
local BodyHandle = ____BodyHandle.BodyHandle
local ____MessageDispatcher = require("engine.MessageDispatcher")
local MessageDispatcher = ____MessageDispatcher.MessageDispatcher
local ____GameplayMemory = require("engine.GameplayMemory")
local GameplayMemory = ____GameplayMemory.GameplayMemory
____exports.GameplayScene = __TS__Class()
local GameplayScene = ____exports.GameplayScene
GameplayScene.name = "GameplayScene"
function GameplayScene.prototype.____constructor(self)
    self.bodies = {}
    self.prefabs = {}
    self.bodyIdMap = __TS__New(Map)
    self.dispatcher = __TS__New(MessageDispatcher, self)
    self.memory = __TS__New(GameplayMemory)
    self.clientInterface = nil
end
function GameplayScene.prototype.setClientInterface(self, clientInterface)
    self.clientInterface = clientInterface
end
function GameplayScene.prototype.addBody(self, bodyNode)
    local handle = __TS__New(BodyHandle, bodyNode)
    handle.isInScene = true
    local ____self_bodies_0 = self.bodies
    ____self_bodies_0[#____self_bodies_0 + 1] = handle
    self.bodyIdMap:set(bodyNode.id, handle)
    return handle
end
function GameplayScene.prototype.addPrefab(self, bodyNode)
    local handle = __TS__New(BodyHandle, bodyNode)
    local ____self_prefabs_1 = self.prefabs
    ____self_prefabs_1[#____self_prefabs_1 + 1] = handle
    return handle
end
function GameplayScene.prototype.getBodyById(self, id)
    return self.bodyIdMap:get(id)
end
function GameplayScene.prototype.clear(self)
    self.bodies = {}
    self.bodyIdMap:clear()
    self.prefabs = {}
    self.dispatcher:clearListeners()
end
function GameplayScene.prototype.initializeMemory(self, memoryOverride)
    self.memory = __TS__ObjectAssign(
        {},
        __TS__New(GameplayMemory),
        memoryOverride
    )
end
function GameplayScene.prototype.preUpdate(self, dt)
    local ____self_memory_2, ____timeSinceStart_3 = self.memory, "timeSinceStart"
    ____self_memory_2[____timeSinceStart_3] = ____self_memory_2[____timeSinceStart_3] + dt
    for ____, body in ipairs(self.bodies) do
        body:initializeElements()
    end
    for ____, body in ipairs(self.bodies) do
        body:startElements()
    end
    self.dispatcher:updateFunctionQueue(dt)
end
function GameplayScene.prototype.update(self)
    self.dispatcher:onUpdate()
end
function GameplayScene.prototype.cloneBody(self, body)
    local clonePointer = body.body:cloneBody()
    if clonePointer ~= nil then
        local handle = self:addBody(clonePointer)
        handle:initializeElements()
        return handle
    end
    return nil
end
function GameplayScene.prototype.clonePrefab(self, prefabName)
    for ____, prefab in ipairs(self.prefabs) do
        if prefab.body.name == prefabName then
            return self:cloneBody(prefab)
        end
    end
    return nil
end
function GameplayScene.prototype.destroyBody(self, body)
    local index = __TS__ArrayIndexOf(self.bodies, body)
    if index >= 0 then
        self.dispatcher:onActorDestroyed(body)
        self.dispatcher:removeAllListenersFromBody(body)
        __TS__ArraySplice(self.bodies, index, 1)
        body.body:destroyBody()
        body.isInScene = false
    end
end
function GameplayScene.prototype.testErrorHandler(self)
    print("test error")
    local foo = nil
    foo:bar()
    return 3
end
__TS__ObjectDefineProperty(
    GameplayScene,
    "instance",
    {get = function(self)
        if self._instance == nil then
            self._instance = __TS__New(____exports.GameplayScene)
        end
        return self._instance
    end}
)
return ____exports
