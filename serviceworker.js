onfetch = (async function(event) {
    if (event.request.url.indexOf("lighthandle")) return;
    //if (event.request.method === "POST") {
        var fd = event.request.formData();
        const file = fd.getAll("images")[0];
        event.respondWith(Response.redirect('https://aidanjacobson.github.io/imagelightcontroller/#light.aidan_s_room_lights', 303));
        const client = await self.clients.get(event.resultingClientId || event.clientId);
        client.postMessage({file, action:"load-img"});
    //}
})