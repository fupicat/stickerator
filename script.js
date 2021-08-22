var img;

window.addEventListener("drop", function(e) {
  e.preventDefault();

  // Handle the event
  imagePasted(e, drawOnCanvas);
});

window.addEventListener("dragover", function(e) {
  e.preventDefault();
});

function drawOnCanvas(imageBlob) {
  // If there's an image, display it in the canvas
  if (imageBlob) {

    // Create an image to render the blob on the canvas
    createImageBitmap(imageBlob)
    .then((bitmap) => {
      img = bitmap;
      updateCanvas()
    });
  }
}

function imagePasted(pasteEvent, callback) {
  if (pasteEvent.dataTransfer == false) {
    if (typeof(callback) == "function") {
      callback(undefined);
    }
  };

  var items = pasteEvent.dataTransfer.items;

  if (items == undefined) {
    if (typeof(callback) == "function") {
      callback(undefined);
    }
  }

  for (var i = 0; i < items.length; i++) {
    
    // Special case for URLs
    if ((items[i].type.indexOf("url") != -1 || items[i].type.indexOf("uri") != -1)
        && pasteEvent.dataTransfer.getData(items[i].type).replace("//", "").indexOf("//") == -1) {
      fetch(pasteEvent.dataTransfer.getData(items[i].type))
      .then(res => res.blob())
      .then(blob => {
        if (typeof(callback) == "function") {
          callback(blob);
        }
      });
      break;
    }

    // Skip content if not image
    if (items[i].type.indexOf("image") == -1) {
      continue;
    }

    // Retrieve image on clipboard as blob
    var blob = items[i].getAsFile();

    if (typeof(callback) == "function") {
      callback(blob);
    }
    break;

  }
}

function updateCanvas() {
  var canvas = document.getElementById("sticker");
  var ctx = canvas.getContext('2d');

  let wh = Math.min(img.width, img.height);;

  let size = Math.floor(wh / 20); //parseInt(sizeInput.value);
  let shadow = Math.floor(wh / 5); //parseInt(shadowInput.value);
  let quality = 50;

  canvas.width = (img.width + shadow) * 1.25;
  canvas.height = (img.height + shadow) * 1.25;

  let centerx = (canvas.width-img.width)/2;
  let centery = (canvas.height-img.height)/2;

  ctx.shadowColor = "black";
  ctx.shadowBlur = shadow;
  ctx.shadowOffsetX = -canvas.width;
  ctx.shadowOffsetY = -canvas.height;
  ctx.drawImage(img, centerx+canvas.width, centery+canvas.height);

  ctx.shadowColor = "white";
  ctx.shadowBlur = 3;

  // Offset loop
  for (let i = 0; i < quality; i++) {
    let point = findNewPoint(0, 0, 360/quality*i, size);
    ctx.shadowOffsetX = point.x-canvas.width;
    ctx.shadowOffsetY = point.y-canvas.height;

    // Draw image with shadow
    ctx.drawImage(img, centerx+canvas.width, centery+canvas.height);
  }

  ctx.shadowColor = "none";
  ctx.drawImage(img, centerx, centery);
}

function findNewPoint(x, y, angle, distance) {
  var result = {};

  result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
  result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);

  return result;
}