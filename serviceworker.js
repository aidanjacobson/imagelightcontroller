var fd;
onfetch = (async function(event) {
    console.log("fetch");
    if (event.request.url.indexOf("upload-image") == -1) return;
    console.log("upload img");
    event.respondWith(Response.redirect('https://aidanjacobson.github.io/imagelightcontroller/?recieving#light.aidan_s_room_lights', 303));
    fd = await event.request.formData();
    const file = fd.get("images");
    const client = await self.clients.get(event.resultingClientId || event.clientId);
    client.postMessage({file, action:"load-img"});
})
console.log("hi");

function hi() {
    console.log("hi");
}