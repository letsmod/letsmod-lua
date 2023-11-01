local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.CreatePrefabsOnDestroyed = __TS__Class()
local CreatePrefabsOnDestroyed = ____exports.CreatePrefabsOnDestroyed
CreatePrefabsOnDestroyed.name = "CreatePrefabsOnDestroyed"
__TS__ClassExtends(CreatePrefabsOnDestroyed, LMent)
function CreatePrefabsOnDestroyed.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body, id, params)
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
        self.destroyed = true
        for ____, prefabName in ipairs(self.prefabNames) do
            local prefab = GameplayScene.instance:clonePrefab(prefabName)
            if prefab then
                prefab.body:setPosition(self.body.body:getPosition())
                prefab.body:setRotation(self.body.body:getRotation())
            end
        end
    end
end
return ____exports
