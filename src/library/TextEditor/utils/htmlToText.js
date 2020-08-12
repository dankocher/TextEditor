const htmlToText = text => {
    //console.log(text)
    let newText = text.replace(/<\/(div|h1|h2|h3|h4|h5|h6|blockquote)>\s*</gmi, v => {
       //console.log(v)
        return v.replace(/>\s*</gmi, '>\n<')
    });
        //.replace(/<\w*><\w*>/gmi, s => s.replace(/></gmi, '>\n  <'));
    //console.log(newText)
    // text = text.replace(/\n/gmi, "");
    // let html = text.split("<div>");
    // // let newHtml = "";
    // // for (const h of html) {
    // //     if (h === "") continue;
    // //     newHtml += `<div>${h.replace("</div>", "")}</div>\n`;
    // // }
    // // return html.join("\n");
    return newText;
};

export default htmlToText;
