import {tag as getTag} from './index';

const getCursor = (cursor, type, action) => {
    if(cursor !== undefined){
        const {document, row, column} = cursor;
        let tag = getTag(type);
        let lines = document.$lines.join('');
        let _lineBefore = JSON.parse(JSON.stringify(document.$lines)).splice(0, row).join('').length;
        let _column = column+_lineBefore;
        //let reg = new RegExp(`<${tag}>` +'.*?'+ `</${tag}>`, 'gmi');
        let reg = new RegExp(`<${tag}(\\s(?=.).*?)?>` +'.*?'+ `</${tag}>`, 'gmi');
        let mathes = lines.match(reg);
        if(mathes !== null){
            let zones = [];
            for(let match of mathes){
                let _zones = zones.filter(z => z.v === match);
                if(_zones.length === 0){
                    zones.push({s: lines.indexOf(match), e: lines.indexOf(match)+match.length, v: match, c: _column})
                } else {
                    zones.push({s: lines.indexOf(match, _zones[_zones.length-1].e), e: lines.indexOf(match, _zones[_zones.length-1].e)+match.length, v: match, c: _column})
                }
            }

            let exist = zones.some(z => z.s<_column && _column<z.e);
            return action ? zones.find(z => z.s<_column && _column<z.e) : exist
        }
    }
};

export default getCursor