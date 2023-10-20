local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____Element = require("engine.Element")
local Element = ____Element.Element
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.DestroyOnZeroHP = __TS__Class()
local DestroyOnZeroHP = ____exports.DestroyOnZeroHP
DestroyOnZeroHP.name = "DestroyOnZeroHP"
__TS__ClassExtends(DestroyOnZeroHP, Element)
function DestroyOnZeroHP.prototype.____constructor(self, body)
    Element.prototype.____constructor(self, body)
    self.destroyed = false
end
function DestroyOnZeroHP.prototype.onInit(self)
    GameplayScene.instance.dispatcher:addListener("hitPointsChanged", self)
end
function DestroyOnZeroHP.prototype.onStart(self)
end
function DestroyOnZeroHP.prototype.onHitPointChange(self, source, previousHP, currentHP)
    if source == self.body and currentHP <= 0 and not self.destroyed then
        GameplayScene.instance:destroyBody(self.body)
        self.destroyed = true
    end
end
return ____exports
