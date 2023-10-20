local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____Element = require("engine.Element")
local Element = ____Element.Element
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.CreatePrefabsOnDestroyed = __TS__Class()
local CreatePrefabsOnDestroyed = ____exports.CreatePrefabsOnDestroyed
CreatePrefabsOnDestroyed.name = "CreatePrefabsOnDestroyed"
__TS__ClassExtends(CreatePrefabsOnDestroyed, Element)
function CreatePrefabsOnDestroyed.prototype.____constructor(self, body, params)
    if params == nil then
        params = {}
    end
    Element.prototype.____constructor(self, body)
    self.destroyed = false
    self.prefabNames = params.prefabNames == nil and ({}) or params.prefabNames
end
function CreatePrefabsOnDestroyed.prototype.onInit(self)
    GameplayScene.instance.dispatcher:addListener("actorDestroyed", self)
end
function CreatePrefabsOnDestroyed.prototype.onStart(self)
end
function CreatePrefabsOnDestroyed.prototype.onActorDestroyed(self, actor)
    if not self.destroyed and actor == self.body then
        print("Creating prefabs", self.prefabNames, #self.prefabNames)
        self.destroyed = true
        for ____, prefabName in ipairs(self.prefabNames) do
            print("name", prefabName)
            local prefab = GameplayScene.instance:clonePrefab(prefabName)
            if prefab then
                prefab.body:setPosition(self.body.body:getPosition())
                prefab.body:setRotation(self.body.body:getRotation())
            end
        end
    end
end
return ____exports
