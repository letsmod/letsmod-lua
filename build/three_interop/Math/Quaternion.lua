

local _quaternion = {}

Quaternion = {}










































function Quaternion.new(x, y, z, w)
   local self = js.new(js.global.THREE.Quaternion, x, y, z, w)
   return self
end
