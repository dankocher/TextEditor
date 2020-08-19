const tag = (type) => {
    let tag = '';
    switch (type) {
        case 'font':
            tag = 'font';
            break;
        case 'span':
            tag = 'span';
            break;
        case 'bold':
            tag = 'b';
            break;
        case 'italic':
            tag = 'i';
            break;
        case 'underline':
            tag = 'u';
            break;
        case 'strikeThrough':
            tag = 'strike';
            break;
        case 'formatblock':
            tag = 'blockquote';
            break;
        case 'a':
            tag = 'a';
            break;
        default:
            break;
    }

    return tag
};

export default tag