local record _js
  new : function(constructor: function(...: any), ...: any)
  
  record global
    record THREE
      Quaternion: function(x: number, y: number, z: number, w: number) : any
      Vector3: function(x: number, y: number, z: number) : any
    end
  end

end

return _js