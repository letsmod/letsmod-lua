local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local ____exports = {}
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
local ____js = require("js")
local global = ____js.global
local js_new = ____js.js_new
____exports.ExamplePlayer = __TS__Class()
local ExamplePlayer = ____exports.ExamplePlayer
ExamplePlayer.name = "ExamplePlayer"
__TS__ClassExtends(ExamplePlayer, LMent)
function ExamplePlayer.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body, id, params)
    self.dragDx = 0
    self.dragDy = 0
    self.maxSpeed = params.maxSpeed == nil and 3 or params.maxSpeed
    self.acceleration = params.acceleration == nil and self.maxSpeed * 5 or params.acceleration
    self.deceleration = params.deceleration == nil and self.maxSpeed * 5 or params.deceleration
    self.arrayTest = self:convertArray(params.arrayTest) or ({})
    print(
        "is array",
        __TS__ArrayIsArray(self.arrayTest)
    )
    print("testing array")
    print("length", #self.arrayTest)
    do
        local i = 0
        while i < #self.arrayTest do
            print(self.arrayTest[i + 1].x, self.arrayTest[i + 1].y, self.arrayTest[i + 1].z)
            i = i + 1
        end
    end
    print("test b")
    __TS__ArrayForEach(
        self.arrayTest,
        function(____, v)
            print(v.x, v.y, v.z)
        end
    )
end
function ExamplePlayer.prototype.onInit(self)
    GameplayScene.instance.dispatcher:addListener("button", self)
    GameplayScene.instance.dispatcher:addListener("drag", self)
    GameplayScene.instance.dispatcher:addListener("update", self)
    GameplayScene.instance.dispatcher:addListener("hitPointsChanged", self)
    GameplayScene.instance.memory.player = self.body
end
function ExamplePlayer.prototype.onStart(self)
end
function ExamplePlayer.prototype.onUpdate(self)
    local velocity = self.body.body:getVelocity()
    local planarVelocity = js_new(global.THREE.Vector3, velocity.x, 0, velocity.z)
    local targetX = self.dragDx * self.maxSpeed
    local targetZ = self.dragDy * self.maxSpeed
    local target = js_new(global.THREE.Vector3, targetX, 0, targetZ)
    local delta = target:sub(planarVelocity)
    local accel
    if self.dragDx == 0 and self.dragDy == 0 then
        accel = self.deceleration / GameplayScene.instance.memory.frameRate
    else
        accel = self.acceleration / GameplayScene.instance.memory.frameRate
    end
    local deltaLengthSq = delta:lengthSq()
    if deltaLengthSq > accel * accel then
        delta = delta:normalize():multiplyScalar(accel)
    end
    local newVelocity = velocity:add(delta)
    self.body.body:setVelocity(newVelocity)
    self.dragDx = 0
    self.dragDy = 0
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
function ExamplePlayer.prototype.onDrag(self, dx, dy)
    self.dragDx = dx
    self.dragDy = dy
end
function ExamplePlayer.prototype.onHitPointChange(self, source, previousHP, currentHP)
    if source == self.body and currentHP <= 0 then
        local ____opt_0 = GameplayScene.instance.clientInterface
        if ____opt_0 ~= nil then
            ____opt_0:loseMod()
        end
    end
end
function ExamplePlayer.prototype.hasSubtype(self, button)
    return button == "AButton"
end
return ____exports
