local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
____exports.Element = __TS__Class()
local Element = ____exports.Element
Element.name = "Element"
function Element.prototype.____constructor(self, body)
    self.body = body
    local ____self_body_elements_0 = self.body.elements
    ____self_body_elements_0[#____self_body_elements_0 + 1] = self
end
local foo = __TS__Class()
foo.name = "foo"
__TS__ClassExtends(foo, ____exports.Element)
function foo.prototype.____constructor(self, body, params)
    foo.____super.prototype.____constructor(self, body)
end
function foo.prototype.onButtonPress(self, button)
end
function foo.prototype.onButtonHold(self, button)
end
function foo.prototype.onButtonRelease(self, button)
end
function foo.prototype.onInit(self)
end
function foo.prototype.onStart(self)
end
function foo.prototype.onUpdate(self)
end
return ____exports
