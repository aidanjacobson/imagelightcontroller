var fd;
onfetch = (async function(event) {
    if ((new URL(event.request.url)).search != "?sharing") return;
    //if (event.request.method === "POST") {
        fd = event.request.formData();
        const file = fd.get("images");
        event.respondWith(Response.redirect('https://aidanjacobson.github.io/imagelightcontroller/?recieving#light.aidan_s_room_lights', 303));
        const client = await self.clients.get(event.resultingClientId || event.clientId);
        client.postMessage({file, action:"load-img"});
    //}
})