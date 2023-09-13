require("three_interop/Math/Vector3")

BodyView = {}



function BodyView.new(position)
   return setmetatable({
      position = position,
   }, BodyView)
end

function BodyView:setPosition(position)
   self.position = position
   return self
end
