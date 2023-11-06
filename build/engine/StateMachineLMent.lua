local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__SetDescriptor = ____lualib.__TS__SetDescriptor
local ____exports = {}
local ____GameplayScene = require("engine.GameplayScene")
local GameplayScene = ____GameplayScene.GameplayScene
local ____LMent = require("engine.LMent")
local LMent = ____LMent.LMent
____exports.State = __TS__Class()
local State = ____exports.State
State.name = "State"
function State.prototype.____constructor(self, name, stateMachine)
    self.name = name
    self.stateMachine = stateMachine
end
____exports.StateMachineLMent = __TS__Class()
local StateMachineLMent = ____exports.StateMachineLMent
StateMachineLMent.name = "StateMachineLMent"
__TS__ClassExtends(StateMachineLMent, LMent)
function StateMachineLMent.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    LMent.prototype.____constructor(self, body, id, params)
    self.states = {}
    self.switchStateQueue = {}
end
function StateMachineLMent.prototype.switchState(self, stateName)
    local nextState = self.states[stateName]
    local ____self_switchStateQueue_0 = self.switchStateQueue
    ____self_switchStateQueue_0[#____self_switchStateQueue_0 + 1] = nextState
    local length = #self.switchStateQueue
    if length == 1 then
        local switchCount = 0
        while #self.switchStateQueue > 0 do
            local next = self.switchStateQueue[1]
            local current = self.currentState
            if current then
                current:onExitState(next)
                self:removeListeners(current)
            end
            if next then
                self.currentState = next
                next:onEnterState(current)
                self:addListeners(next)
            end
            table.remove(self.switchStateQueue, 1)
            switchCount = switchCount + 1
            if switchCount > 200 then
                error("StateMachineElement.switchState: infinite loop detected", 0)
            end
        end
    end
end
function StateMachineLMent.prototype.getState(self, stateName)
    return self.states[stateName]
end
function StateMachineLMent.prototype.removeListeners(self, state)
    local dispatcher = GameplayScene.instance.dispatcher
    if state.onUpdate then
        dispatcher:removeListener("update", self)
    end
    if state.onCollision then
        dispatcher:removeListener("collision", self)
    end
    if state.onButtonHold or state.onButtonPress or state.onButtonRelease then
        dispatcher:removeListener("button", self)
    end
    if state.onDrag then
        dispatcher:removeListener("drag", self)
    end
    if state.onTap then
        dispatcher:removeListener("tap", self)
    end
    if state.onSwipe then
        dispatcher:removeListener("swipe", self)
    end
    if state.onHoldStart or state.onHoldRelease then
        dispatcher:removeListener("hold", self)
    end
    if state.onAimStart or state.onAim or state.onAimRelease then
        dispatcher:removeListener("aim", self)
    end
    if state.onInteract then
        dispatcher:removeListener("interact", self)
    end
    if state.onActorDestroyed then
        dispatcher:removeListener("actorDestroyed", self)
    end
    if state.onHitPointChange then
        dispatcher:removeListener("hitPointsChanged", self)
    end
    if state.onTrigger then
        dispatcher:removeListener("trigger", self)
    end
end
function StateMachineLMent.prototype.addListeners(self, state)
    local dispatcher = GameplayScene.instance.dispatcher
    if state.onUpdate then
        dispatcher:addListener("update", self)
    end
    if state.onCollision then
        dispatcher:addListener("collision", self)
    end
    if state.onButtonHold or state.onButtonPress or state.onButtonRelease then
        dispatcher:addListener("button", self)
    end
    if state.onDrag then
        dispatcher:addListener("drag", self)
    end
    if state.onTap then
        dispatcher:addListener("tap", self)
    end
    if state.onSwipe then
        dispatcher:addListener("swipe", self)
    end
    if state.onHoldStart or state.onHoldRelease then
        dispatcher:addListener("hold", self)
    end
    if state.onAimStart or state.onAim or state.onAimRelease then
        dispatcher:addListener("aim", self)
    end
    if state.onInteract then
        dispatcher:addListener("interact", self)
    end
    if state.onActorDestroyed then
        dispatcher:addListener("actorDestroyed", self)
    end
    if state.onHitPointChange then
        dispatcher:addListener("hitPointsChanged", self)
    end
    if state.onTrigger then
        dispatcher:addListener("trigger", self)
    end
end
function StateMachineLMent.prototype.onUpdate(self, dt)
    local ____opt_1 = self.currentState
    if ____opt_1 and ____opt_1.onUpdate then
        self.currentState:onUpdate(dt)
    end
end
function StateMachineLMent.prototype.onCollision(self, info)
    local ____opt_3 = self.currentState
    if ____opt_3 and ____opt_3.onCollision then
        self.currentState:onCollision(info)
    end
end
function StateMachineLMent.prototype.onButtonHold(self, button)
    local ____opt_5 = self.currentState
    if ____opt_5 and ____opt_5.onButtonHold then
        self.currentState:onButtonHold(button)
    end
end
function StateMachineLMent.prototype.onButtonPress(self, button)
    local ____opt_7 = self.currentState
    if ____opt_7 and ____opt_7.onButtonPress then
        self.currentState:onButtonPress(button)
    end
end
function StateMachineLMent.prototype.onButtonRelease(self, button)
    local ____opt_9 = self.currentState
    if ____opt_9 and ____opt_9.onButtonRelease then
        self.currentState:onButtonRelease(button)
    end
end
function StateMachineLMent.prototype.onDrag(self, dx, dy)
    local ____opt_11 = self.currentState
    if ____opt_11 and ____opt_11.onDrag then
        self.currentState:onDrag(dx, dy)
    end
end
function StateMachineLMent.prototype.onTap(self)
    local ____opt_13 = self.currentState
    if ____opt_13 and ____opt_13.onTap then
        self.currentState:onTap()
    end
end
function StateMachineLMent.prototype.onSwipe(self, dx, dy)
    local ____opt_15 = self.currentState
    if ____opt_15 and ____opt_15.onSwipe then
        self.currentState:onSwipe(dx, dy)
    end
end
function StateMachineLMent.prototype.onHoldStart(self)
    local ____opt_17 = self.currentState
    if ____opt_17 and ____opt_17.onHoldStart then
        self.currentState:onHoldStart()
    end
end
function StateMachineLMent.prototype.onHoldRelease(self)
    local ____opt_19 = self.currentState
    if ____opt_19 and ____opt_19.onHoldRelease then
        self.currentState:onHoldRelease()
    end
end
function StateMachineLMent.prototype.onAimStart(self)
    local ____opt_21 = self.currentState
    if ____opt_21 and ____opt_21.onAimStart then
        self.currentState:onAimStart()
    end
end
function StateMachineLMent.prototype.onAim(self, dx, dy)
    local ____opt_23 = self.currentState
    if ____opt_23 and ____opt_23.onAim then
        self.currentState:onAim(dx, dy)
    end
end
function StateMachineLMent.prototype.onAimRelease(self, dx, dy)
    local ____opt_25 = self.currentState
    if ____opt_25 and ____opt_25.onAimRelease then
        self.currentState:onAimRelease(dx, dy)
    end
end
function StateMachineLMent.prototype.isInInteractionRange(self, interactor)
    local ____opt_27 = self.currentState
    if ____opt_27 and ____opt_27.isInInteractionRange then
        return self.currentState:isInInteractionRange(interactor)
    end
    return false
end
function StateMachineLMent.prototype.onInteract(self, interactor)
    local ____opt_29 = self.currentState
    if ____opt_29 and ____opt_29.onInteract then
        return self.currentState:onInteract(interactor)
    end
    return false
end
function StateMachineLMent.prototype.onActorDestroyed(self, actor)
    local ____opt_31 = self.currentState
    if ____opt_31 and ____opt_31.onActorDestroyed then
        self.currentState:onActorDestroyed(actor)
    end
end
function StateMachineLMent.prototype.onHitPointChange(self, source, previousHP, currentHP)
    local ____opt_33 = self.currentState
    if ____opt_33 and ____opt_33.onHitPointChange then
        self.currentState:onHitPointChange(source, previousHP, currentHP)
    end
end
function StateMachineLMent.prototype.onTrigger(self, source, triggerId)
    local ____opt_35 = self.currentState
    if ____opt_35 and ____opt_35.onTrigger then
        self.currentState:onTrigger(source, triggerId)
    end
end
function StateMachineLMent.prototype.hasSubtype(self, subtype)
    local ____opt_37 = self.currentState
    if ____opt_37 and ____opt_37.hasSubtype and self.currentState:hasSubtype(subtype) then
        return true
    end
    return false
end
__TS__SetDescriptor(
    StateMachineLMent.prototype,
    "interactionNameOrIcon",
    {get = function(self)
        local ____opt_39 = self.currentState
        return ____opt_39 and ____opt_39.interactionNameOrIcon or ""
    end},
    true
)
__TS__SetDescriptor(
    StateMachineLMent.prototype,
    "interactionPriority",
    {get = function(self)
        local ____opt_41 = self.currentState
        return ____opt_41 and ____opt_41.interactionPriority or 0
    end},
    true
)
return ____exports
