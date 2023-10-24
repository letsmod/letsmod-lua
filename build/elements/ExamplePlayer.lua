local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
____exports.ExamplePlayer = __TS__Class()
local ExamplePlayer = ____exports.ExamplePlayer
ExamplePlayer.name = "ExamplePlayer"
__TS__ClassExtends(ExamplePlayer, LMent)
function ExamplePlayer.prototype.____constructor(self, body, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body)
end
function ExamplePlayer.prototype.onInit(self)
    GameplayScene.instance.dispatcher:addListener("button", self)
    GameplayScene.instance.dispatcher:addListener("drag", self)
    GameplayScene.instance.memory.player = self.body
end
function ExamplePlayer.prototype.onStart(self)
end
function ExamplePlayer.prototype.onButtonPress(self, button)
    if button == "AButton" then
        local velocity = self.body.body:getVelocity()
        velocity.y = velocity.y + 10
        self.body.body:setVelocity(velocity)
    end
end
function ExamplePlayer.prototype.onButtonHold(self, button)
end
function ExamplePlayer.prototype.onButtonRelease(self, button)
end
function ExamplePlayer.prototype.onDragStart(self, dx, dy)
end
function ExamplePlayer.prototype.onDrag(self, dx, dy)
end
function ExamplePlayer.prototype.onDragRelease(self, dx, dy)
end
function ExamplePlayer.prototype.hasSubtype(self, button)
    return button == "AButton"
end
return ____exports
