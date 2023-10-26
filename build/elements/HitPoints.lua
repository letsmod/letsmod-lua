local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.DamageTeam = DamageTeam or ({})
____exports.DamageTeam.neutral = 0
____exports.DamageTeam[____exports.DamageTeam.neutral] = "neutral"
____exports.DamageTeam.player = 1
____exports.DamageTeam[____exports.DamageTeam.player] = "player"
____exports.DamageTeam.enemy = 2
____exports.DamageTeam[____exports.DamageTeam.enemy] = "enemy"
____exports.HitPoints = __TS__Class()
local HitPoints = ____exports.HitPoints
HitPoints.name = "HitPoints"
__TS__ClassExtends(HitPoints, LMent)
function HitPoints.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body, id)
    self.maxHitpoints = params.maxHitpoints == nil and 1 or params.maxHitpoints
    self.hitpoints = params.hitpoints == nil and self.maxHitpoints or params.hitpoints
    self.damageTypeMultipliers = params.damageTypeMultipliers == nil and ({}) or params.damageTypeMultipliers
    self.team = params.team == nil and 0 or params.team
end
function HitPoints.prototype.onInit(self)
end
function HitPoints.prototype.onStart(self)
end
function HitPoints.prototype.damage(self, amount, ____type, teamFlags)
    if teamFlags == nil then
        teamFlags = 0
    end
    local prevHitpoints = self.hitpoints
    local multiplier = 1
    if ____type ~= nil then
        local maybeMultiplier = self.damageTypeMultipliers[____type]
        if maybeMultiplier ~= nil then
            multiplier = maybeMultiplier
        end
    end
    local damage = amount * multiplier
    if teamFlags ~= 0 and self.team ~= 0 and teamFlags & self.team == 0 then
        damage = 0
    end
    if damage ~= 0 then
        self.hitpoints = self.hitpoints - amount
        if self.hitpoints < 0 then
            self.hitpoints = 0
        end
        if self.hitpoints > self.maxHitpoints then
            self.hitpoints = self.maxHitpoints
        end
        if prevHitpoints ~= self.hitpoints then
            GameplayScene.instance.dispatcher:onHitPointChange(self.body, prevHitpoints, self.hitpoints)
        end
    end
end
function HitPoints.prototype.heal(self, amount)
    self:damage(-amount)
end
return ____exports
