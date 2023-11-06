local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____StateMachineLMent = require("engine.StateMachineLMent")
local StateMachineLMent = ____StateMachineLMent.StateMachineLMent
local State = ____StateMachineLMent.State
local ____js = require("js")
local global = ____js.global
local js_new = ____js.js_new
local ClosedState = __TS__Class()
ClosedState.name = "ClosedState"
__TS__ClassExtends(ClosedState, State)
function ClosedState.prototype.____constructor(self, stateMachine, triggerId)
    State.prototype.____constructor(self, "closed", stateMachine)
    self.triggerId = triggerId
end
function ClosedState.prototype.onEnterState(self, previousState)
end
function ClosedState.prototype.onExitState(self, nextState)
end
function ClosedState.prototype.onTrigger(self, source, triggerId)
    if triggerId == self.triggerId then
        self.stateMachine:switchState("opening")
    end
end
function ClosedState.prototype.hasSubtype(self, subtype)
    return subtype == self.triggerId
end
local OpeningState = __TS__Class()
OpeningState.name = "OpeningState"
__TS__ClassExtends(OpeningState, State)
function OpeningState.prototype.____constructor(self, stateMachine, initialPosition, targetOffset, speed)
    State.prototype.____constructor(self, "opening", stateMachine)
    self.targetPosition = initialPosition:clone():add(targetOffset)
    self.speed = speed
end
function OpeningState.prototype.onEnterState(self, previousState)
end
function OpeningState.prototype.onExitState(self, nextState)
end
function OpeningState.prototype.onUpdate(self, dt)
    local delta = self.targetPosition:clone():sub(self.stateMachine.body.body:getPosition())
    local length = delta:length()
    local speedDt = self.speed * dt
    if length < speedDt then
        self.stateMachine.body.body:setPosition(self.targetPosition)
        self.stateMachine:switchState("open")
    else
        delta:normalize():multiplyScalar(speedDt)
        self.stateMachine.body.body:offsetPosition(delta)
    end
end
local OpenState = __TS__Class()
OpenState.name = "OpenState"
__TS__ClassExtends(OpenState, State)
function OpenState.prototype.____constructor(self, stateMachine, triggerId, stayOpenDuration)
    State.prototype.____constructor(self, "open", stateMachine)
    self.triggerId = triggerId
    self.stayOpenDuration = stayOpenDuration
    self.currentOpenDuration = 0
end
function OpenState.prototype.onEnterState(self, previousState)
    self.currentOpenDuration = 0
end
function OpenState.prototype.onExitState(self, nextState)
end
function OpenState.prototype.onUpdate(self, dt)
    self.currentOpenDuration = self.currentOpenDuration + dt
    if self.currentOpenDuration >= self.stayOpenDuration - 2.2e-16 then
        self.stateMachine:switchState("closing")
    end
end
function OpenState.prototype.onTrigger(self, source, triggerId)
    if triggerId == self.triggerId then
        self.currentOpenDuration = 0
    end
end
function OpenState.prototype.hasSubtype(self, subtype)
    return subtype == self.triggerId
end
local ClosingState = __TS__Class()
ClosingState.name = "ClosingState"
__TS__ClassExtends(ClosingState, State)
function ClosingState.prototype.____constructor(self, stateMachine, triggerId, initialPosition, speed)
    State.prototype.____constructor(self, "closing", stateMachine)
    self.triggerId = triggerId
    self.initialPosition = initialPosition:clone()
    self.speed = speed
end
function ClosingState.prototype.onEnterState(self, previousState)
end
function ClosingState.prototype.onExitState(self, nextState)
end
function ClosingState.prototype.onUpdate(self, dt)
    local delta = self.initialPosition:clone():sub(self.stateMachine.body.body:getPosition())
    local length = delta:length()
    local speedDt = self.speed * dt
    if length < speedDt then
        self.stateMachine.body.body:setPosition(self.initialPosition)
        self.stateMachine:switchState("closed")
    else
        delta:normalize():multiplyScalar(speedDt)
        self.stateMachine.body.body:offsetPosition(delta)
    end
end
function ClosingState.prototype.onTrigger(self, source, triggerId)
    if triggerId == self.triggerId then
        self.stateMachine:switchState("opening")
    end
end
function ClosingState.prototype.hasSubtype(self, subtype)
    return subtype == self.triggerId
end
____exports.AutomaticSlidingDoor = __TS__Class()
local AutomaticSlidingDoor = ____exports.AutomaticSlidingDoor
AutomaticSlidingDoor.name = "AutomaticSlidingDoor"
__TS__ClassExtends(AutomaticSlidingDoor, StateMachineLMent)
function AutomaticSlidingDoor.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    StateMachineLMent.prototype.____constructor(self, body, id, params)
    self.openOnTrigger = params.openOnTrigger
    self.openOffset = js_new(global.THREE.Vector3, 0, 0, 0)
    if params.openOffset ~= nil then
        self.openOffset:copy(params.openOffset)
    end
    self.openSpeed = params.openSpeed == nil and 1 or params.openSpeed
    self.closeSpeed = params.closeSpeed == nil and 1 or params.closeSpeed
    self.stayOpenDuration = params.stayOpenDuration == nil and 1 or params.stayOpenDuration
end
function AutomaticSlidingDoor.prototype.onInit(self)
    self.states = {
        closed = __TS__New(ClosedState, self, self.openOnTrigger),
        opening = __TS__New(
            OpeningState,
            self,
            self.body.body:getPosition(),
            self.openOffset,
            self.openSpeed
        ),
        open = __TS__New(OpenState, self, self.openOnTrigger, self.stayOpenDuration),
        closing = __TS__New(
            ClosingState,
            self,
            self.openOnTrigger,
            self.body.body:getPosition(),
            self.closeSpeed
        )
    }
    self:switchState("closed")
end
function AutomaticSlidingDoor.prototype.onStart(self)
end
return ____exports
