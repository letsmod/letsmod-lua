-- fengari-interop
global js = require "js"

-- three.js files
require "src/three_interop/Math/Vector3"
require "src/three_interop/Math/Quaternion"
require "src/three_interop/Math/Matrix3"
require "src/three_interop/Math/Matrix4"
require "src/three_interop/Math/Color"
require "src/three_interop/Core/Object3D"

global record Person
    name: string
    age: number
end

global type RichPerson = record
    super: Person
    money: number
end