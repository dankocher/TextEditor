const componentToHex = c => {
    let hex = (+c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
};

const rgbToHex = (color) => {
    if (color === 'transparent' || color === '') {
        return 'black'
    }

    color = color.replace(/rgb|\)|\(|\s/gmi, '');
    color = color.split(',');

    return "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
};

export {rgbToHex}