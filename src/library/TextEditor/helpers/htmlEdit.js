import htmlToText from "../utils/htmlToText";
import {tag as getTag, getCursor, makeColor} from "./index";


const htmlEdit = (type, p, typeColor, props) => {
    const {cursor, urlMessage, onChange, selection} = props;

    let lines = JSON.parse(JSON.stringify(cursor.document.$lines));

    if(type === 'createlink'){
        let sZone, eZone;

        if(selection === undefined){
            sZone = getCursor(cursor, 'a', true)
        } else {
            const {anchor, cursor} = selection;
            let start = anchor.row > cursor.row ? {row: cursor.row, el: cursor.column} :  {row: anchor.row, el: anchor.column};
            let end = anchor.row > cursor.row ?  {row: anchor.row, el: anchor.column} :  {row: cursor.row, el: cursor.column};
            let rSimp = start.row === end.row;
            let cSimp = start.el > end.el;
            sZone = getCursor({document:{$lines:lines}, row: start.row, column: rSimp && cSimp ? end.el : start.el}, 'a', true);
            eZone = getCursor({document:{$lines:lines}, row: end.row, column: rSimp && cSimp ? start.el : end.el}, 'a', true);
        }

        if(sZone !== undefined && (selection === undefined || (selection !== undefined && JSON.stringify({...sZone, c: undefined}) === JSON.stringify({...eZone, c: undefined})))){
            if(selection !== undefined && JSON.stringify({...sZone, c: undefined}) === JSON.stringify({...eZone, c: undefined})){
                lines = lines.join('').split('');
                let str = JSON.parse(JSON.stringify(lines)).splice(sZone.c, eZone.c-sZone.c).join('');
                let strV = sZone.v.replace(/(^<a.*?>)|(<\/a>$)/gmi, '');
                if(strV.length <= str.length){
                    lines.splice(sZone.s, sZone.e - sZone.s, strV)
                } else {
                    let link = JSON.parse(JSON.stringify(sZone.v)).split('').splice(0, sZone.v.indexOf(strV));
                    lines.splice(sZone.c, eZone.c-sZone.c, `</a>${str}${link.join('')}`)
                }
                lines = htmlToText(lines.join(''));
                onChange(lines)
            } else {
                lines = lines.join('').split('');
                lines.splice(sZone.s, sZone.e - sZone.s, sZone.v.replace(/<\/?a.*?>/gmi, ''));
                lines = lines.join('');
                onChange(htmlToText(lines))
            }
        } else {
            props.modalMessage({modalVisible: true, title: urlMessage, modalType: 'input', modalFunction: async v => this.createLink(v, cursor, selection, lines, onChange)})
        }
    } else {

        if(selection === undefined){
            console.log(1)
            let zone = getCursor(cursor, type, true);
            let row = cursor.row;
            let _lineBefore = JSON.parse(JSON.stringify(lines)).splice(0, row).join('').length;
            let el = cursor.column+_lineBefore;
            let line = lines.join('').split('');
            let tag = getTag(type);

            if(zone === undefined){
                if (tag === 'blockquote') {
                    line.splice(el, 0, `\n<${tag}${p ? ` color="${p}"`: ''}></${tag}>\n`);
                    line = line.join('');
                    line = htmlToText(line);
                    onChange(line)
                } else if (tag !== '') {
                    line.splice(el, 0, `<${tag}${p ? ` color="${p}"`: ''}></${tag}>`);
                    line = line.join('');
                    line = htmlToText(line);
                    onChange(line)
                }
            } else {
                let reg = new RegExp(`^<${tag}(\\s(?=.).*?)?>`, 'gmi');
                let _tag = zone.v.match(reg) || [`<${tag}>`];



                if (p) {
                    _tag[0] = _tag[0].replace(/color=("|').*?("|')/gmi, `color="${p}"`)
                }

                if (tag === 'blockquote' && zone) {
                    line.splice(
                        zone.s,
                        zone.v.length,
                        zone.v.replace(/^<blockquote>/gmi, '<div>').replace(/(<\/blockquote>)$/gmi, '</div>')
                    )
                } else if(zone.v.length <= `${_tag[0]}</${tag}>`.length){
                    line.splice(zone.s, zone.v.length, ``);
                } else {
                    line.splice(el, 0, `</${tag}>${_tag[0]}`);
                }

                line = line.join('');
                line = htmlToText(line);
                onChange(line)
            }
        } else {
            console.log(2)
            const {anchor, cursor} = selection;
            let start = anchor.row > cursor.row ? {row: cursor.row, el: cursor.column} :  {row: anchor.row, el: anchor.column};
            let end = anchor.row > cursor.row ?  {row: anchor.row, el: anchor.column} :  {row: cursor.row, el: cursor.column};
            let tag = getTag(type);
            if(tag !== ''){
                let rSimp = start.row === end.row;
                let cSimp = start.el > end.el;
                let sZone = getCursor({document:{$lines:lines}, row: start.row, column: rSimp && cSimp ? end.el : start.el}, type, true);
                let eZone = getCursor({document:{$lines:lines}, row: end.row, column: rSimp && cSimp ? start.el : end.el}, type, true);
                let _lineBeforeS = JSON.parse(JSON.stringify(lines)).splice(0, start.row).join('').length;
                let _lineBeforeE = JSON.parse(JSON.stringify(lines)).splice(0, end.row).join('').length;
                start.el = start.el+_lineBeforeS;
                end.el = end.el + _lineBeforeE;
                lines = lines.join('').split('');

                let a = start.el < end.el;
                let _color = typeColor ? makeColor(p, typeColor) : '';

                if(sZone === undefined && eZone === undefined) {
                    let str = lines.splice((a ? start.el : end.el), Math.abs(start.el - end.el));
                    let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');

                    lines.splice(a ? start.el : end.el, 0, `<${tag}${_color}>${str.join('').replace(reg, '')}</${tag}>`)
                } else {
                    if(sZone === undefined || eZone === undefined){
                        let str = sZone === undefined ? lines.splice((a ? start.el : end.el), eZone.e - (a ? start.el : end.el)) : lines.splice(sZone.s, (!a ? start.el : end.el)-sZone.s);
                        let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');
                        let _reg = new RegExp(`^<${tag}(\\s(?=.).*?)?>`, 'gmi');
                        let _tag = (sZone === undefined ?eZone:sZone).v.match(_reg) || [`<${tag}${_color}>`];
                        lines.splice((sZone === undefined ? (a ? start.el : end.el) : sZone.s), 0, `${_tag[0]}${str.join('').replace(reg, '')}</${tag}>`)
                    } else if(JSON.stringify({...sZone, c: undefined}) === JSON.stringify({...eZone, c: undefined})){
                        let str = JSON.parse(JSON.stringify(lines)).splice((a ? start.el : end.el), Math.abs(start.el - end.el));
                        let check = sZone.v.replace(str.join(''), '');
                        let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');
                        let _reg = new RegExp(`^<${tag}(\\s(?=.).*?)?>`, 'gmi');
                        let _tag = sZone.v.match(_reg) || [`<${tag}${_color}>`];
                        if(check.length <= `${_tag[0]}</${tag}>`.length){
                            let _str = sZone.v.replace(/(^<.*?>)|(<\/.*?>$)/gmi, '');
                            lines.splice(sZone.s, sZone.v.length, `${_str}`)
                        }else {
                            lines.splice(a ? start.el : end.el, 0, `</${tag}>${str.join('').replace(reg, '')}${_tag[0]}`)
                        }
                    } else {
                        let str = JSON.parse(JSON.stringify(lines)).splice(sZone.s, eZone.e-sZone.s);
                        let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');
                        lines.splice(sZone.s, eZone.e-sZone.s, `<${tag}${_color}>${str.join('').replace(reg, '')}</${tag}>`)
                    }
                }
                //console.log(tag)

                lines = lines.join('');
                lines = htmlToText(lines);
                onChange(lines)
            }

        }
    }
};

export default htmlEdit