local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
____exports.Element = __TS__Class()
local Element = ____exports.Element
Element.name = "Element"
function Element.prototype.____constructor(self, body)
    self.body = body
    local ____self_body_elements_0 = self.body.elements
    ____self_body_elements_0[#____self_body_elements_0 + 1] = self
    self.enabled = true
    self.initialized = false
    self.started = false
end
return ____exports
