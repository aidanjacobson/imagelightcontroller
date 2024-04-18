function promptForPassword() {
    localStorage.dkey = prompt("Please Enter Decryption Key");
    location.reload();
}

function doAccessCheck() {
    if (localStorage.dkey) {
        access_token = CryptoJS.AES.decrypt(encrypted_access_token, localStorage.dkey).toString(CryptoJS.enc.Utf8);
        if (access_token == "") {
            promptForPassword();
        }
    } else {
        promptForPassword();
    }
}

var encrypted_access_token = "U2FsdGVkX1+BS7W57qcuksbGeOhMELdKhPGdFruceXcLa74zjeuaGq1ELrfEpq+GjaeCRQiAA2OaUJY0rfXil0NB/VlMeqHNTxo69hBYu3eQcGHhKSrQGY0hn6obMS3w5nagv1Q+kM6OcoRjewNBgAvEK97AcVapxiusHjPlbpUEfllwb5TgiznJouFPYaUj3hwKq6Km3vVy+cbTIoZxMryMuEPXcvAybrhwrJtsidyWy0Z7VWyDg949CULWnaseJtPR+EGMaOtAP5tXwmmV6A==";
var access_token = "";
var entityId = "";

window.onload = function() {
    var failed = false;
    try {
        doAccessCheck();
    } catch(e) {
        failed = true;
        localStorage.removeItem("dkey");
        location.reload();
    }
    if (!failed && access_token != "") {
        if (location.hash != "" && location.hash != "#") {
            entityId = location.hash.substring(1);
        } else {
            entityId = prompt("Enter the ID of entity to control", "light.aidan_s_room_lights");
        }
    }
}

function analyzeImageData(imageData) {
    var data = imageData.data;
    var totals = [0,0,0];
    for (var i = 0; i < data.length; i+=4) {
        totals[0] += data[i];
        totals[1] += data[i+1];
        totals[2] += data[i+2];
    }
    var averages = totals.map(n=>n/(data.length/4));
    return averages;
}

HTMLImageElement.prototype.waitForLoad = function() {
    var im = this;
    return new Promise(function (resolve) {
        im.addEventListener("load", ()=>resolve());
    })
}

var canvas, ctx;
async function submit(url) {
    var i = new Image();
    i.src = url;
    await i.waitForLoad();
    canvas = document.getElementById("canvas");
    canvas.width = i.naturalWidth;
    canvas.height = i.naturalHeight;
    ctx = canvas.getContext("2d");
    ctx.drawImage(i, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var average = analyzeImageData(imageData);
    console.log(average);
    canvas.onclick = function() {
        canvas.requestFullscreen();
    }
    canvas.requestFullscreen();
    await submitServiceCall(average);
}

function submitUpload() {
    if (imageUpload.files.length == 0) return;
    var file = imageUpload.files[0];
    var url = URL.createObjectURL(file);
    submit(url);
}

function submitServiceCall(rgb) {
    var url = `https://aidanjacobson.duckdns.org:8123/api/services/light/turn_on`;
    if (localStorage.getItem("local_weblight") == "true") {
        url = `https://homeassistant.local:8123/api/services/light/turn_on`;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.crossOrigin = 'anonymous';
    xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data = {
        entity_id: entityId,
        rgb_color: rgb
    }
    xhr.send(JSON.stringify(data));
    return new Promise(function(resolve) {
        xhr.onload = function() {
            resolve();
        }
    })
}

function dragOverHandler(ev) {
    ev.preventDefault();
  }

function doDrop(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    //var url = URL.createObjectURL(file);
    //console.log(file, url);
    //submit(url);
    var reader = new FileReader();
    reader.onload = function() {
        //await submit(reader.result);
        var result = reader.result;
        lightControlURL(result);
    }
    reader.readAsDataURL(file);
}
var registration;
if ('serviceWorker' in navigator) {
    (async function() {
        registration = await navigator.serviceWorker.register('serviceworker.js');
    })();
}

// navigator.serviceWorker.addEventListener("message", async function(e) {
//     if (e.data.action == "load-img") {
//         var url = URL.createObjectURL(e.data.file);
//         await submit(url);
//         setTimeout(()=>window.close(), 500);
//     }
// })

navigator.serviceWorker.addEventListener("message", async function(e) {
    if (e.data.action == "load-img") {
        // var url = URL.createObjectURL(e.data.file);
        // await submit(url);
        var reader = new FileReader();
        reader.onload = function() {
            //await submit(reader.result);
            var result = reader.result;
            lightControlURL(result);
        }
        reader.readAsDataURL(e.data.file);
        setTimeout(()=>window.close(), 500);
    }
})

function lightControlURL(url) {
    return new Promise((resolve, reject) => {
        var serviceURL = `http://aidanjacobson.duckdns.org:9168/setAll/url(${encodeURIComponent(url)})`;
        var x = new XMLHttpRequest();
        x.open("GET", proxify(serviceURL));
        x.onload = function() {
            resolve();
        }
        x.send();
    })
    //console.log(url);
}

function proxify(url) {
    return `https://aidanjacobson.duckdns.org:42068/proxy/?url=${encodeURIComponent(url)}`;
}