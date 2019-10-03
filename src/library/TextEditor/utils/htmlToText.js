const htmlToText = text => {

    text = text.replace(/\n/gmi, "");
    let html = text.split("<div>");
    // let newHtml = "";
    // for (const h of html) {
    //     if (h === "") continue;
    //     newHtml += `<div>${h.replace("</div>", "")}</div>\n`;
    // }
    // return html.join("\n");
    return text;
};

export default htmlToText;
