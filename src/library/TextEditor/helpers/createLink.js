import {getCursor} from "./index";
import htmlToText from "../utils/htmlToText";

const createLink = (v, cursor, selection, lines, onChange, props) => {

    if(selection === undefined){
        let row = cursor.row;
        let el = cursor.column;
        let line = lines[row].split('');
        if(v !== undefined && v.trim() !== ''){
            line.splice(el, 0, `<a href='${v}'></a>`);
            let _line = line.join('');
            lines[row] = _line;
            onChange(lines.join('\n'))
        }
    } else {
        const {anchor, cursor} = selection;

        let start = anchor.row > cursor.row ? {row: cursor.row, el: cursor.column} :  {row: anchor.row, el: anchor.column};
        let end = anchor.row > cursor.row ?  {row: anchor.row, el: anchor.column} :  {row: cursor.row, el: cursor.column};
        let rSimp = start.row === end.row;
        let cSimp = start.el > end.el;
        let sZone = getCursor({document:{$lines:lines}, row: start.row, column: rSimp && cSimp ? end.el : start.el}, 'a', true);
        let eZone = getCursor({document:{$lines:lines}, row: end.row, column: rSimp && cSimp ? start.el : end.el}, 'a', true);
        let _lineBeforeS = JSON.parse(JSON.stringify(lines)).splice(0, start.row).join('').length;
        let _lineBeforeE = JSON.parse(JSON.stringify(lines)).splice(0, end.row).join('').length;
        start.el = start.el+_lineBeforeS;
        end.el = end.el + _lineBeforeE;
        let a = start.el < end.el;

        if (sZone === undefined && eZone === undefined) {
            lines = lines.join('').split('');
            let str = lines.splice((a ? start.el : end.el), Math.abs(start.el-end.el));
            lines.splice((a ? start.el : end.el), 0, `<a href='${v}'>${str.join('')}</a>`);
            lines = htmlToText(lines.join(''));
            onChange(lines)
        } else {
            if (sZone === undefined || eZone === undefined) {
                lines = lines.join('').split('');
                let str = lines.splice((sZone === undefined ? (a ? start.el : end.el) : sZone.s), Math.abs(sZone === undefined ? (a ? start.el : end.el) - eZone.e : sZone.s - (a ? end.el : start.el))).join('');
                lines.splice((sZone === undefined ? (a ? start.el : end.el) : sZone.s), 0, `<a href='${v}'>${str.replace(/<\/?a.*?>/gmi, '')}</a>`);
                lines = htmlToText(lines.join(''));
                onChange(lines)
            } else if (JSON.stringify({...sZone, c: undefined}) !== JSON.stringify({...eZone, c: undefined})) {
                lines = lines.join('').split('');
                let str = lines.splice(sZone.s, eZone.e-sZone.s).join('').replace(sZone.v, '').replace(eZone.v, '');
                lines.splice(sZone.s, 0, `<a href='${v}'>${sZone.v.replace(/(^<a.*?>)|(<\/a>$)/gmi, '' ) + str + eZone.v.replace(/(^<a.*?>)|(<\/a>$)/gmi, '' )}</a>`);
                lines = htmlToText(lines.join(''));
                onChange(lines)
            }
        }
    }
    props.cleanModalMessage()
};

export default createLink