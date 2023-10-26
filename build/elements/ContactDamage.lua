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
____exports.ContactDamage = __TS__Class()
local ContactDamage = ____exports.ContactDamage
ContactDamage.name = "ContactDamage"
__TS__ClassExtends(ContactDamage, LMent)
function ContactDamage.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body, id)
    self.damageValue = params.damageValue == nil and 1 or params.damageValue
    self.damageType = params.damageType
    self.teamFlags = params.teamFlags
    self.cooldown = params.cooldown == nil and 0 or params.cooldown
    self.contactCooldowns = {}
end
function ContactDamage.prototype.onInit(self)
    GameplayScene.instance.dispatcher:addListener("collision", self)
end
function ContactDamage.prototype.onStart(self)
end
function ContactDamage.prototype.onCollision(self, info)
    local other = GameplayScene.instance:getBodyById(info:getOtherObjectId())
    if other ~= nil then
        local now = GameplayScene.instance.memory.timeSinceStart
        local hpElement = other:getElement(HitPoints)
        if hpElement ~= nil then
            if self.contactCooldowns[other.body.id] == nil or now - self.contactCooldowns[other.body.id] >= self.cooldown then
                hpElement:damage(self.damageValue, self.damageType, self.teamFlags)
                self.contactCooldowns[other.body.id] = now
            end
        end
    end
end
return ____exports
