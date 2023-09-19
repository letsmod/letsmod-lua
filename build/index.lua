local ____lualib = require("lualib_bundle")
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____js = require("js")
local js_new = ____js.js_new
local global = ____js.global
local ____bodyHandle = require("engine.bodyHandle")
local BodyHandle = ____bodyHandle.BodyHandle
print("Hello World")
local q = js_new(global.THREE.Quaternion)
q:set(1, 2, 3, 4)
q:normalize()
print(q.x, q.y, q.z, q.w)
local c = js_new(global.THREE.Color, 65280)
print(c.r, c.g, c.b)
local bh = __TS__New(BodyHandle, nil, nil)
return ____exports
