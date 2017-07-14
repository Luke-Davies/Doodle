document.addEventListener("DOMContentLoaded", function() {
   var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var canvas  = $('#drawing')[0];
   var rInput  = $('#rInput');
   var gInput  = $('#gInput');
   var bInput  = $('#bInput');
   var penSizeInput  = $('#penSizeInput');
   var lineTypeSelect  = $('#lineTypeSelect');
   var roomSelect  = $('#roomSelect');
   
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var socket  = io.connect();
   
   var r = rInput.val();
   var g = gInput.val();
   var b = bInput.val();
   var penSize = penSizeInput.val();
   var lineType = lineTypeSelect.val();
   var room = roomSelect.val();
   
   
   rInput.bind("propertychange change click keyup input paste", function(event){
      r = rInput.val()
   });
   
   gInput.bind("propertychange change click keyup input paste", function(event){
      g = gInput.val()
   });
   
   bInput.bind("propertychange change click keyup input paste", function(event){
      b = bInput.val()
   });
   
   penSizeInput.bind("propertychange change click keyup input paste", function(event){
      penSize = penSizeInput.val()
   });
   
   lineTypeSelect.bind("propertychange change click keyup input paste", function(event){
      lineType = lineTypeSelect.val()
   });
   
   roomSelect.bind("propertychange change click keyup input paste", function(event){
      room = roomSelect.val()
   });

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;
   
   canvas.style.cursor="crosshair"

   // register mouse event handlers
   canvas.onmousedown = function(e){ mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
      mousePos = getMousePos(canvas, e)
      
      mouse.pos.x = mousePos.x / width;
      mouse.pos.y = mousePos.y / height;
      mouse.move = true;
   };
   
   function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

   // draw line received from server
	socket.on('draw_line', function (data) {
      var line = data.line;
      context.beginPath();
      context.strokeStyle = 'rgb(' + line.col.r + ',' + line.col.g + ',' + line.col.b + ')';
      context.lineWidth=line.width;
      context.lineCap = line.lineType || "round";
      context.moveTo(line.coords[0].x * width, line.coords[0].y * height);
      context.lineTo(line.coords[1].x * width, line.coords[1].y * height);
      context.stroke();
   });
   
   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('draw_line', { "line": { "coords":[ mouse.pos, mouse.pos_prev ], "col" : {"r":r, "g":g, "b":b }, "width" : penSize , "lineType" : lineType}});
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }
   mainLoop();
});