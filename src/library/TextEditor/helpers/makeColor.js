const makeColor = (p, type) => {
    return type === 'foreColor' ? ` style="color: ${p}"` : ` style="background-color: ${p}"`
};

export default makeColor