local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____Element = require("engine.Element")
local Element = ____Element.Element
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.HitPointsElement = __TS__Class()
local HitPointsElement = ____exports.HitPointsElement
HitPointsElement.name = "HitPointsElement"
__TS__ClassExtends(HitPointsElement, Element)
function HitPointsElement.prototype.____constructor(self, body, params)
    if params == nil then
        params = {}
    end
    Element.prototype.____constructor(self, body)
    self.maxHitpoints = params.maxHitpoints == nil and 1 or params.maxHitpoints
    self.hitpoints = params.hitpoints == nil and self.maxHitpoints or params.hitpoints
end
function HitPointsElement.prototype.onInit(self)
end
function HitPointsElement.prototype.onStart(self)
end
function HitPointsElement.prototype.damage(self, amount)
    local prevHitpoints = self.hitpoints
    self.hitpoints = self.hitpoints - amount
    if self.hitpoints < 0 then
        self.hitpoints = 0
    end
    if self.hitpoints > self.maxHitpoints then
        self.hitpoints = self.maxHitpoints
    end
    GameplayScene.instance.dispatcher:onHitPointChange(self.body, prevHitpoints, self.hitpoints)
end
function HitPointsElement.prototype.heal(self, amount)
    self:damage(-amount)
end
return ____exports
