local record _js
  new : function(constructor: function(...: any), ...: any)
  
  record global
    record THREE
      Quaternion: function() : any
      Vector3: function() : any
      Matrix3: function() : any
      Matrix4: function() : any
      Color: function(r: number, g: number, b: number) : any
      Object3D: function() : any
    end
  end

end

return _js