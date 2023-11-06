local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____StateMachineLMent = require("engine.StateMachineLMent")
local StateMachineLMent = ____StateMachineLMent.StateMachineLMent
____exports.AutomaticDoor = __TS__Class()
local AutomaticDoor = ____exports.AutomaticDoor
AutomaticDoor.name = "AutomaticDoor"
__TS__ClassExtends(AutomaticDoor, StateMachineLMent)
function AutomaticDoor.prototype.____constructor(self, body, id, params)
    if params == nil then
        params = {}
    end
    StateMachineLMent.prototype.____constructor(
        self,
        body,
        id,
        {},
        params
    )
    self.openOnTriggers = params.openOnTriggers == nil and ({}) or params.openOnTriggers
end
function AutomaticDoor.prototype.onInit(self)
end
function AutomaticDoor.prototype.onStart(self)
end
return ____exports
