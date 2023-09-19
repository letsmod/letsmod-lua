local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____bodyHandle = require("engine.bodyHandle")
local BodyHandle = ____bodyHandle.BodyHandle
____exports.GameplayScene = __TS__Class()
local GameplayScene = ____exports.GameplayScene
GameplayScene.name = "GameplayScene"
function GameplayScene.prototype.____constructor(self)
    self.bodies = {}
end
function GameplayScene.prototype.addBody(self, bodyNode, physicsBody)
    local ____self_bodies_0 = self.bodies
    ____self_bodies_0[#____self_bodies_0 + 1] = __TS__New(BodyHandle, bodyNode, physicsBody)
end
function GameplayScene.prototype.clear(self)
    self.bodies = {}
end
return ____exports
