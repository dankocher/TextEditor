const host = {
    uri: window.location.port === "5000"
    || window.location.port === "3000"
    || window.location.port === "3333"
        ? "https://adpmf.goodstudio.by" : ""
};


const api = {
    save_picture: {method: "POST", uri: "/api/admin/picture/save"},
};


export { host, api };