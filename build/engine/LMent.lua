local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local ____exports = {}
____exports.LMent = __TS__Class()
local LMent = ____exports.LMent
LMent.name = "LMent"
function LMent.prototype.____constructor(self, body, id, params)
    self.body = body
    local ____self_body_elements_0 = self.body.elements
    ____self_body_elements_0[#____self_body_elements_0 + 1] = self
    local ____temp_1
    if params.enabled == nil then
        ____temp_1 = true
    else
        ____temp_1 = params.enabled
    end
    self.enabled = ____temp_1
    self.initialized = false
    self.started = false
    self.id = id
end
return ____exports
