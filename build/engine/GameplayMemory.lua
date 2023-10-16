local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
____exports.GameplayMemory = __TS__Class()
local GameplayMemory = ____exports.GameplayMemory
GameplayMemory.name = "GameplayMemory"
function GameplayMemory.prototype.____constructor(self)
    self.timeSinceStart = 0
    self.player = nil
end
return ____exports
