window.api.receive("read-one-from-storage", (data) => {

    if(data.request.key == "configs") {
        configs.updateConfigFromStorage(data.response)
        return
    }

    console.log("read-one-from-storage", data);
});
