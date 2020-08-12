import {api, host} from "../constants/api";

export const uploadPicture = async (name, base64File) => {

    const file = await fetch(base64File)
        .then(res => res.blob())
        .then(blob => {
            return new File([blob], name)
        });

    const $api = api.save_picture;
    //const $api = api.save_picture;
    let url = host.uri + $api.uri;
    const form = new FormData();

    form.append("picture", file, name);
    form.append("name", name);

    return await fetch(url, {
        method: $api.method,
        // headers: {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json',
        // },
        cache: 'no-cache',
        credentials: 'include',
        body: form,
    }).then(res => res.json())
        .then(async res => {
            return res
        })
        .catch((e) => {
            return {ok: false, status: "unreachable"}
        });
};