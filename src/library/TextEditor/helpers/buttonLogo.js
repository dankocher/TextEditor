import {rgbToHex} from "../utils/rgbConverter";
import Icon from "../components/Icon";
import React from "react";

const buttonLogo = type => {
    let color = 'black';
    let icon = '';

    if (type === 'foreColor' || type === 'hiliteColor') {
        color = rgbToHex(document.queryCommandValue(type === 'hiliteColor' ? 'BackColor' : type))
    }
    let white = color === '#ffffff' || color === 'rgb(255, 255, 255)';
    switch (type) {
        case 'foreColor':
            //console.log('f', color)
            //icon = 'font-color';
            return (
                <div className={`foreColor${white ? ' white-c' : ''}`}>
                    <div>A</div>
                    <div style={{
                        backgroundColor: color
                    }}>
                    </div>
                </div>
            );
        case 'hiliteColor':
            //console.log('h', color)
            //icon = 'fill-color';
            return (
                <div className={`hiliteColor${white ? ' white-c' : ''}`}>
                    <div><Icon name={'color_fill'} size={18} color={'black'}/></div>
                    <div style={{
                        backgroundColor: color
                    }}>
                    </div>
                </div>
            );
        case 'bold':
            icon = 'bold';
            break;
        case 'italic':
            icon = 'italic';
            break;
        case 'underline':
            icon = 'underline';
            break;
        case 'strikeThrough':
            icon = 'strikethrough';
            break;
        case 'justifyLeft':
            icon = 'paragraph-left';
            break;
        case 'justifyCenter':
            icon = 'paragraph-center';
            break;
        case 'justifyRight':
            icon = 'paragraph-right';
            break;
        case 'formatblock':
            icon = 'quotes';
            break;
        case 'createlink':
            icon = 'link';
            break;
        default:
            break;
    }

    return <Icon name={icon} size={16} color={color}/>
};

export default buttonLogo