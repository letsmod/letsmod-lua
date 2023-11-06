local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__InstanceOf = ____lualib.__TS__InstanceOf
local ____exports = {}
____exports.PhysicsBodyType = PhysicsBodyType or ({})
____exports.PhysicsBodyType.physical = 0
____exports.PhysicsBodyType[____exports.PhysicsBodyType.physical] = "physical"
____exports.PhysicsBodyType.kinematic = 1
____exports.PhysicsBodyType[____exports.PhysicsBodyType.kinematic] = "kinematic"
____exports.PhysicsBodyType.hologram = 2
____exports.PhysicsBodyType[____exports.PhysicsBodyType.hologram] = "hologram"
____exports.BodyHandle = __TS__Class()
local BodyHandle = ____exports.BodyHandle
BodyHandle.name = "BodyHandle"
function BodyHandle.prototype.____constructor(self, bodyNode)
    self.elements = {}
    self.isInScene = false
    self.bodyGroup = {self}
    self.body = bodyNode
end
function BodyHandle.prototype.getElement(self, T)
    do
        local i = 0
        while i < #self.elements do
            if __TS__InstanceOf(self.elements[i + 1], T) then
                return self.elements[i + 1]
            end
            i = i + 1
        end
    end
    return nil
end
function BodyHandle.prototype.getElementByTypeName(self, name)
    do
        local i = 0
        while i < #self.elements do
            if self.elements[i + 1].constructor.name == name then
                return self.elements[i + 1]
            end
            i = i + 1
        end
    end
    return nil
end
function BodyHandle.prototype.addElement(self, elem)
    local ____self_elements_0 = self.elements
    ____self_elements_0[#____self_elements_0 + 1] = elem
end
function BodyHandle.prototype.initializeElements(self)
    for ____, elem in ipairs(self.elements) do
        if not elem.initialized then
            elem:onInit()
            elem.initialized = true
        end
    end
end
function BodyHandle.prototype.startElements(self)
    for ____, elem in ipairs(self.elements) do
        if not elem.started then
            elem:onStart()
            elem.started = true
        end
    end
end
return ____exports
