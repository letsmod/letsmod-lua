js = require("js")

require("letsmod-api")
require("three_interop/Math/Quaternion")

print("start of lua index")

local foo = Quaternion.new():set(1, 2, 3, 4)
foo:normalize()

print("lua index done")

return foo
