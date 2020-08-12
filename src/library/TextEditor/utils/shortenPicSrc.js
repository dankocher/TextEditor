const shortenPicSrc = value => {
    // let parts = value.split(/<img src=".*?"/);
    // let imgs = value.match(/<img src=".{14}/gmi);
    // //console.log(value)
    // return imgs === null ? value : parts.join(`${imgs[0]}..."`)
    return value
};

export default shortenPicSrc