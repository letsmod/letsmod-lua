--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
____exports.Elements = require("elements.ElementTypes")
____exports.scene = GameplayScene.instance
print(#____exports.scene.bodies)
print("loaded lua engine")
return ____exports
