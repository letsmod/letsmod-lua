local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__Iterator = ____lualib.__TS__Iterator
local __TS__ArraySlice = ____lualib.__TS__ArraySlice
local ____exports = {}
local ____MessageHandlers = require("engine.MessageHandlers")
local HandlerTypes = ____MessageHandlers.HandlerTypes
function ____exports.MakeListenerDict(self)
    local dict = {}
    for ____, key in ipairs(HandlerTypes) do
        dict[key] = {}
    end
    return dict
end
____exports.MessageDispatcher = __TS__Class()
local MessageDispatcher = ____exports.MessageDispatcher
MessageDispatcher.name = "MessageDispatcher"
function MessageDispatcher.prototype.____constructor(self, scene)
    self.listeners = ____exports.MakeListenerDict(nil)
    self.functionQueue = {}
    self.scene = scene
end
function MessageDispatcher.prototype.clearListeners(self)
    self.listeners = ____exports.MakeListenerDict(nil)
    self.functionQueue = {}
end
function MessageDispatcher.prototype.removeAllListenersFromBody(self, body)
    for ____, elem in ipairs(body.elements) do
        self:removeAllListenersFromElement(elem)
    end
end
function MessageDispatcher.prototype.removeAllListenersFromElement(self, elem)
    for key in pairs(self.listeners) do
        local listeners = self.listeners[key]
        do
            local i = 0
            while i < #listeners do
                if listeners[i + 1] == elem then
                    __TS__ArraySplice(listeners, i, 1)
                    i = i - 1
                end
                i = i + 1
            end
        end
    end
    do
        local i = 0
        while i < #self.functionQueue do
            if self.functionQueue[i + 1].element == elem then
                __TS__ArraySplice(self.functionQueue, i, 1)
                i = i - 1
            end
            i = i + 1
        end
    end
end
function MessageDispatcher.prototype.removeListener(self, ____type, listener)
    local listeners = self.listeners[____type]
    local index = __TS__ArrayIndexOf(listeners, listener)
    if index >= 0 then
        __TS__ArraySplice(listeners, index, 1)
    end
end
function MessageDispatcher.prototype.addListener(self, ____type, listener)
    local ____self_listeners_____type_0 = self.listeners[____type]
    ____self_listeners_____type_0[#____self_listeners_____type_0 + 1] = listener
end
function MessageDispatcher.prototype.hasListenerOfType(self, ____type, subtype)
    if self.listeners[____type] == nil then
        return false
    end
    if subtype ~= nil then
        for ____, listener in __TS__Iterator(self.listeners[____type]) do
            if listener.hasSubtype ~= nil and listener:hasSubtype(subtype) then
                return true
            end
        end
        return false
    else
        return #self.listeners[____type] > 0
    end
end
function MessageDispatcher.prototype.queueDelayedFunction(self, element, func, delay, ...)
    local args = {...}
    local fq = {element = element, func = func, delay = delay, args = args}
    local ____self_functionQueue_1 = self.functionQueue
    ____self_functionQueue_1[#____self_functionQueue_1 + 1] = fq
    return fq
end
function MessageDispatcher.prototype.removeQueuedFunction(self, fq)
    local index = __TS__ArrayIndexOf(self.functionQueue, fq)
    if index >= 0 then
        __TS__ArraySplice(self.functionQueue, index, 1)
    end
end
function MessageDispatcher.prototype.updateFunctionQueue(self, dt)
    local funcsToCall = {}
    do
        local i = 0
        while i < #self.functionQueue do
            local fq = self.functionQueue[i + 1]
            fq.delay = fq.delay - dt
            if fq.delay <= 0 then
                funcsToCall[#funcsToCall + 1] = fq
                __TS__ArraySplice(self.functionQueue, i, 1)
                i = i - 1
            end
            i = i + 1
        end
    end
    for ____, fq in ipairs(funcsToCall) do
        fq:func(table.unpack(fq.args))
    end
end
function MessageDispatcher.prototype.onUpdate(self, dt)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.update)) do
        if listener.enabled then
            listener:onUpdate(dt)
        end
    end
end
function MessageDispatcher.prototype.onCollision(self, infoFactory)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.collision)) do
        if infoFactory.aId ~= nil and listener.body.body.id == infoFactory.aId then
            if listener.enabled then
                listener:onCollision(infoFactory:makeCollisionInfo("a"))
            end
        elseif infoFactory.bId ~= nil and listener.body.body.id == infoFactory.bId then
            if listener.enabled then
                listener:onCollision(infoFactory:makeCollisionInfo("b"))
            end
        end
    end
end
function MessageDispatcher.prototype.onButtonPress(self, button)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.button)) do
        if listener.enabled then
            listener:onButtonPress(button)
        end
    end
end
function MessageDispatcher.prototype.onButtonHold(self, button)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.button)) do
        if listener.enabled then
            listener:onButtonHold(button)
        end
    end
end
function MessageDispatcher.prototype.onButtonRelease(self, button)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.button)) do
        if listener.enabled then
            listener:onButtonRelease(button)
        end
    end
end
function MessageDispatcher.prototype.onDrag(self, dx, dy)
    for ____, listener in ipairs(self.listeners.drag) do
        if listener.enabled then
            listener:onDrag(dx, dy)
        end
    end
end
function MessageDispatcher.prototype.onTap(self)
    local didInteract = false
    if self.scene.memory.player then
        didInteract = self:onInteract(self.scene.memory.player)
    end
    if not didInteract then
        for ____, listener in ipairs(__TS__ArraySlice(self.listeners.tap)) do
            if listener.enabled then
                listener:onTap()
            end
        end
    end
end
function MessageDispatcher.prototype.onSwipe(self, dx, dy)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.swipe)) do
        if listener.enabled then
            listener:onSwipe(dx, dy)
        end
    end
end
function MessageDispatcher.prototype.onHoldStart(self)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.hold)) do
        if listener.enabled then
            listener:onHoldStart()
        end
    end
end
function MessageDispatcher.prototype.onHoldRelease(self)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.hold)) do
        if listener.enabled then
            listener:onHoldRelease()
        end
    end
end
function MessageDispatcher.prototype.onAimStart(self)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.aim)) do
        if listener.enabled then
            listener:onAimStart()
        end
    end
end
function MessageDispatcher.prototype.onAim(self, dx, dy)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.aim)) do
        if listener.enabled then
            listener:onAim(dx, dy)
        end
    end
end
function MessageDispatcher.prototype.onAimRelease(self, dx, dy)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.aim)) do
        if listener.enabled then
            listener:onAimRelease(dx, dy)
        end
    end
end
function MessageDispatcher.prototype.onInteract(self, interactor)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.interact)) do
        if listener.enabled and listener:isInInteractionRange(interactor) then
            local didInteract = listener:onInteract(interactor)
            if didInteract then
                return didInteract
            end
        end
    end
    return false
end
function MessageDispatcher.prototype.onActorDestroyed(self, actor)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.actorDestroyed)) do
        if listener.enabled then
            listener:onActorDestroyed(actor)
        end
    end
end
function MessageDispatcher.prototype.onHitPointChange(self, source, previousHP, currentHP)
    for ____, listener in ipairs(__TS__ArraySlice(self.listeners.hitPointsChanged)) do
        if listener.enabled then
            listener:onHitPointChange(source, previousHP, currentHP)
        end
    end
end
function MessageDispatcher.prototype.onTrigger(self, source, triggerId, context)
    if context == "local" then
        local body = source.body
        for ____, listener in ipairs(__TS__ArraySlice(self.listeners.trigger)) do
            if listener.enabled and listener.body == body and listener:hasSubtype(triggerId) then
                listener:onTrigger(source, triggerId)
            end
        end
    elseif context == "group" then
        for ____, listener in ipairs(__TS__ArraySlice(self.listeners.trigger)) do
            if listener.enabled and listener:hasSubtype(triggerId) then
                for ____, body in ipairs(listener.body.bodyGroup) do
                    if listener.body == body then
                        listener:onTrigger(source, triggerId)
                    end
                end
            end
        end
    else
        for ____, listener in ipairs(__TS__ArraySlice(self.listeners.trigger)) do
            if listener.enabled and listener:hasSubtype(triggerId) then
                listener:onTrigger(source, triggerId)
            end
        end
    end
end
return ____exports
