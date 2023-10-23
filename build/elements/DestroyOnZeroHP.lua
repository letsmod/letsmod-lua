local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.DestroyOnZeroHP = __TS__Class()
local DestroyOnZeroHP = ____exports.DestroyOnZeroHP
DestroyOnZeroHP.name = "DestroyOnZeroHP"
__TS__ClassExtends(DestroyOnZeroHP, LMent)
function DestroyOnZeroHP.prototype.____constructor(self, body, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body)
    self.destroyed = false
    self.destructionDelay = params.destructionDelay == nil and 0 or params.destructionDelay
end
function DestroyOnZeroHP.prototype.onInit(self)
    GameplayScene.instance.dispatcher:addListener("hitPointsChanged", self)
end
function DestroyOnZeroHP.prototype.onStart(self)
end
function DestroyOnZeroHP.prototype.doDestroy(self)
    GameplayScene.instance:destroyBody(self.body)
end
function DestroyOnZeroHP.prototype.onHitPointChange(self, source, previousHP, currentHP)
    if source == self.body and currentHP <= 0 and not self.destroyed then
        if self.destructionDelay <= 0 then
            self:doDestroy()
        else
            GameplayScene.instance.dispatcher:queueDelayedFunction(
                nil,
                function() return self:doDestroy() end,
                self.destructionDelay
            )
        end
        self.destroyed = true
    end
end
return ____exports
