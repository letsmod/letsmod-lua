global record HSL
    h: number
    s: number
    l: number
end

global record RGB
    r: number
    g: number
    b: number
end

global record Color
  r: number
  g: number
  b: number

  set:function(self: Color, r:number, g: number, b: number) : Color

  setFromVector3:function(self: Color, vector: Vector3) : Color
  setScalar:function(self: Color, scalar: number) : Color
  setHex:function(self: Color, hex: number) : Color

  setRGB:function(self: Color, r: number, g: number, b: number) : Color
  setHSL:function(self: Color, h: number, s: number, l: number) : Color
  setStyle:function(self: Color, style: string) : Color
  setColorName:function(self: Color, style: string) : Color

  clone:function(self: Color) : Color
  copy:function(self: Color, color: Color) : Color

  copySRGBTOLinear:function(self: Color, color: Color) : Color
  copyLinearToSRGB:function(self: Color, color: Color) : Color
  convertSRGBTOLinear:function(self: Color) : Color
  convertLinearToSRGB:function(self: Color) : Color

  getHex:function(self: Color) : number
  getHexString:function(self: Color) : string

  getHSL:function(self: Color, target: HSL) : HSL
  getRGB:function(self: Color, target: RGB) : RGB

  getStyle:function(self: Color) : string

  offsetHSL:function(self: Color, h: number, s: number, l: number) : Color

  add:function(self: Color, color: Color) : Color
  addColors:function(self: Color, color1: Color, color2: Color) : Color
  addScalar:function(self: Color, s: number) : Color

  applyMatrix3:function(self: Color, m: Matrix3) : Color

  sub:function(self: Color, color: Color) : Color
  multiply:function(self: Color, color: Color) : Color
  multiplyScalar:function(self: Color, s: number) : Color

  lerp:function(self: Color, color: Color, alpha: number) : Color
  lerpColors:function(self: Color, color1: Color, color2: Color, alpha: number) : Color
  lerpHSL:function(self: Color, color: Color, alpha: number) : Color

  equals:function(self: Color, color: Color) : boolean
end

function Color.new(r, g, b) : Color
    local self : Color= js.new(js.global.THREE.Color, r, g, b)
    return self
end