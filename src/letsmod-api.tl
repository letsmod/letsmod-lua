require "three_interop/Math/Vector3"

global record BodyView
  position: Vector3
end

function BodyView.new(position: Vector3) : BodyView
  return setmetatable({
    position = position
  }, BodyView)
end  

function BodyView:setPosition(position: Vector3) : BodyView
  self.position = position
  return self
end
