var fd;
onfetch = (async function(event) {
    console.log("fetch");
    if (event.request.url.indexOf("upload-image") == -1) return;
    //if (event.request.method === "POST") {
        fd = event.request.formData();
        const file = fd.get("images");
        event.respondWith(Response.redirect('https://aidanjacobson.github.io/imagelightcontroller/?recieving#light.aidan_s_room_lights', 303));
        const client = await self.clients.get(event.resultingClientId || event.clientId);
        client.postMessage({file, action:"load-img"});
    //}
})
console.log("hi");

function hi() {
    console.log("hi");
}