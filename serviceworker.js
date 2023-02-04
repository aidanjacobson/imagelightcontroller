self.addEventListener("fetch", function(event) {
    const url = new URL(event.request.url);
    if (event.request.method === "POST") {
        var fd = event.request.formData();
        const imageFiles = fd.getAll("images")[0]
    }
})