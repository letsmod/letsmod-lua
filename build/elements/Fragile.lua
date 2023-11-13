local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
local ____HitPoints = require("elements.HitPoints")
local HitPoints = ____HitPoints.HitPoints
____exports.Fragile = __TS__Class()
local Fragile = ____exports.Fragile
Fragile.name = "Fragile"
__TS__ClassExtends(Fragile, LMent)
function Fragile.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body, id, params)
    self.damageValue = params.damageValue == nil and 1 or params.damageValue
    self.damageType = params.damageType == nil and "blunt" or params.damageType
    self.cooldown = params.cooldown == nil and 0 or params.cooldown
    self.deltaVThreshold = params.deltaVThreshold == nil and 5 or params.deltaVThreshold
    self.lastDamagedTime = -math.huge
end
function Fragile.prototype.onInit(self)
    GameplayScene.instance.dispatcher:addListener("collision", self)
end
function Fragile.prototype.onStart(self)
end
function Fragile.prototype.onCollision(self, info)
    local now = GameplayScene.instance.memory.timeSinceStart
    local contactDeltaV = info:getDeltaVRelative()
    if now - self.lastDamagedTime >= self.cooldown then
        if contactDeltaV:length() >= self.deltaVThreshold then
            local hpElement = self.body:getElement(HitPoints)
            if hpElement ~= nil then
                hpElement:damage(self.damageValue, self.damageType)
                self.lastDamagedTime = now
            end
        end
    end
end
return ____exports
