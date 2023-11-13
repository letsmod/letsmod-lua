--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.Elements = require("elements._ElementTypes")
do
    local ____BodyHandle = require("engine.BodyHandle")
    local BodyHandle = ____BodyHandle.BodyHandle
    ____exports.BodyHandle = BodyHandle
end
____exports.scene = GameplayScene.instance
print("loaded lua engine")
return ____exports
