const normalizeHtml = text => {
    //let html = text.split("<div>");
    if(text === '<br>' || text.trim() === ''){
        return '<div><br></div>'
    }
    let pictures = text.match(/<div>\s?<img src=".*?">(<br>)?<\/div>/gmi);
    //console.log(text)
    let newHtml = text;
    if(pictures !== null){
        //for(let pic of pictures){
            newHtml = newHtml.replace(/<div>\s?<img src=".*?">(<br>)?<\/div>/gmi, v => {
                return v.replace(/<div>\s?<img src="/, '<div class="picture"><img src="')
            });
        //}
    }

    let float = text.match(/<img float="" src=".*?">/gmi);
    if(float !== null){
        for(let str of float){
            newHtml = newHtml.replace(/<img float="" src=".*?">/gmi, v => v.replace(/<img float=""/gmi, '<img float="" style="float: left; margin: 0 10px 0 0"'))
        }
    }

    return newHtml
        //.replace(/(<\/\w*>\s+)+<\w*>/gmi, s => s.replace(/>\s*</gmi, '><'))
        //.replace(/(<\w*>\s+)+<\w*>/gmi, s=> {
        //console.log(s)
        //return s.replace(/>\s*</gmi, '><');
        //return s
    //})
        .replace(/<div class="picture"><br><\/div>/gmi, v => {
        let myDiv = document.getElementsByClassName('text-editor')[0];
        let range = document.createRange();
        let sel = window.getSelection();
        let nodes = Array.prototype.slice.call(myDiv.childNodes).map(v => v.outerHTML);
        let i = nodes.indexOf('<div class="picture"><br></div>');
        if(i !== -1){
            setTimeout(() => {
                //console.log(i)
                range.setStart(myDiv.childNodes[i], 0);
                sel.removeAllRanges();
                sel.addRange(range);
                myDiv.focus();
            }, 0);
        }
        //return v
        return '<div><br></div>'
    })
        //.replace(/<div class=('|")picture('|")>(<br>)?<\/div>/gmi, '<div></div>');
    //return text;
};

export default normalizeHtml;
