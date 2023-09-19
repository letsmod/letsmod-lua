local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__InstanceOf = ____lualib.__TS__InstanceOf
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____element = require("engine.element")
local Element = ____element.Element
____exports.BodyHandle = __TS__Class()
local BodyHandle = ____exports.BodyHandle
BodyHandle.name = "BodyHandle"
function BodyHandle.prototype.____constructor(self, bodyNode, physicsBody)
    self.elements = {}
    self.body = bodyNode
    self.physicsBody = physicsBody
end
function BodyHandle.prototype.getElement(self, T)
    print("typeof T ", T)
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
print("beep")
____exports.blarg = __TS__Class()
local blarg = ____exports.blarg
blarg.name = "blarg"
__TS__ClassExtends(blarg, Element)
function blarg.prototype.onInit(self)
end
function blarg.prototype.onStart(self)
end
local boo = __TS__New(____exports.BodyHandle, nil, nil)
local blargo = __TS__New(____exports.blarg, boo)
local boop = boo:getElement(____exports.blarg)
print("boop ", boop)
print(
    "beep ",
    boo:getElement(____exports.BodyHandle)
)
return ____exports
