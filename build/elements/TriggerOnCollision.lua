local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
____exports.TriggerOnCollision = __TS__Class()
local TriggerOnCollision = ____exports.TriggerOnCollision
TriggerOnCollision.name = "TriggerOnCollision"
__TS__ClassExtends(TriggerOnCollision, LMent)
function TriggerOnCollision.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body, id, params)
    self.triggerId = params.triggerId
    self.triggerContext = params.triggerContext == nil and "group" or params.triggerContext
    local ____ = self.triggerOnCollisionWithElementType
end
function TriggerOnCollision.prototype.onInit(self)
end
function TriggerOnCollision.prototype.onStart(self)
end
function TriggerOnCollision.prototype.onCollision(self, info)
    if self.triggerOnCollisionWithElementType == nil then
        self:sendTrigger()
    else
        local other = GameplayScene.instance:getBodyById(info:getOtherObjectId())
        if (other and other:getElementByTypeName(self.triggerOnCollisionWithElementType)) ~= nil then
            self:sendTrigger()
        end
    end
end
function TriggerOnCollision.prototype.sendTrigger(self)
    if self.triggerId ~= nil then
        GameplayScene.instance.dispatcher:onTrigger(self, self.triggerId, self.triggerContext)
    end
end
return ____exports
