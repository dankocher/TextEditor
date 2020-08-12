import React, {Component} from "react";
import PropTypes from "prop-types";
import './styles.scss'
import onClickOutside from "react-onclickoutside";
import Icon from "../Icon";
import htmlToText from "../../utils/htmlToText";

class Selector extends Component{

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        data: PropTypes.array,
        editor: PropTypes.object,
        type: PropTypes.string
    };

    state={
        isOpen: false,
        hovered: "",
        selected: null,
        updated: new Date().getTime()
    };

    componentDidMount() {
        if (this.props.data.length > 0) {
            this.setState({selected: this.props.data[0].key})
        }

        let editor = document.getElementsByClassName('text-editor')[0];

        editor.addEventListener('click', this.selection);
        editor.addEventListener('keyup', this.selection)
    }

    selection = () => {
        this.setState({updated: new Date().getTime()})
    };

    componentWillUnmount() {
        let editor = document.getElementsByClassName('text-editor')[0];

        editor.removeEventListener('click', this.selection);
        editor.removeEventListener('keyup', this.selection)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.type === 'header') {
            let header;

            if (this.props.cursor) {
                let zone = this.getCursor(this.props.cursor, this.props.type, true);

                if (zone !== undefined) {
                    header = (zone.v[1]+zone.v[2]).toUpperCase();
                }

            } else {
                header = document.queryCommandValue('formatBlock').toUpperCase();
            }

            let h = this.props.data.find(o => o.value === header);

            if (h !== undefined && h.key !== this.state.selected) {
                this.setState({selected: h.key})
            }
        } else {
            let ul, ulKey, ol, olKey;

            if (this.props.cursor) {
                let zone = this.getCursor(this.props.cursor, this.props.type, true);
                if(zone !== undefined){
                    ul = (zone.v[1]+zone.v[2]) === 'ul';
                    ol = !ul;
                }
            } else {
                ul = document.queryCommandState('insertUnorderedList');
                ol = document.queryCommandState('insertOrderedList');
            }

            ulKey = this.props.data.find(o => o.value === 'UL').key;
            olKey = this.props.data.find(o => o.value === 'OL').key;

            if (ul && this.state.selected !== ulKey) {
                this.setState({selected: ulKey})
            } else if (ol && this.state.selected !== olKey) {
                this.setState({selected: olKey})
            }
        }
    }

    toggle = async (force) => {
        this.setState({isOpen: !this.state.isOpen})
    };

    editHtml(type) {
        const {cursor, selection, onChange} = this.props;

        let lines = JSON.parse(JSON.stringify(cursor.document.$lines));

        if (selection === undefined) {
            let zone = this.getCursor(cursor, (type === 'ul' || type === 'ol') ? 'list' : 'header', true);
            let row = cursor.row;
            let el = cursor.column;
            let line = lines[row];
            let tag = type;
            let l = (type === 'ul' || type === 'ol');

            if (tag !== '') {
                if (zone === undefined) {
                    let regS = new RegExp(`<${tag}(\\s(?=.).*?)?>` + (l? '<li(\\s(?=.).*?)?>' : ''), 'gmi');
                    let regE = new RegExp( (l? '</li>' : '') + `</${tag}>`, 'gmi');

                    lines[row] = `<${tag}>${l ? '<li>' : ''}${line}${l ? '</li>' : ''}</${tag}>`
                        .replace(regS, `${l ? '<div>' : ''}<${tag}>${l ? '<li>' : ''}`)
                        .replace(regE, `${l ? '</li>' : ''}</${tag}>${l ? '</div>' : ''}`);

                    onChange(lines.join('\n'))
                } else {
                    let regS = new RegExp(`<${tag}(\\s(?=.).*?)?>` + (l? '<li(\\s(?=.).*?)?>' : '') + `(<\\w*>)?`, 'gmi');
                    let regE = new RegExp( `(<\/\\w*>)?`+ (l? '</li>' : '') + `</${tag}>`, 'gmi');

                    let _tag = zone.v[1]+zone.v[2];

                    if ( _tag !== tag) {
                        regS = new RegExp(`<${_tag}(\\s(?=.).*?)?>`, 'gmi');
                        regE = new RegExp(`</${_tag}>`, 'gmi');
                    }

                    if (l) {
                        let pos = JSON.parse(JSON.stringify(lines)).splice(0, row).join('').length + el;
                        let newList = this.getListPosition(zone, pos, _tag, tag);

                        lines = lines.join('').split('');
                        lines.splice(zone.s, zone.e-zone.s, newList);
                        lines = htmlToText(lines.join(''));

                        onChange(lines)
                    } else {
                        let _lines = lines.join('').split('');

                        _lines.splice(zone.s, zone.e-zone.s, `<div>${zone.v.replace(regS, (_tag === tag ? '' : `<${tag}>`)).replace(regE, (_tag === tag ? '' : `</${tag}>`))}</div>`);
                        _lines = htmlToText(_lines.join(''));

                        onChange(_lines)
                    }
                }
            }
        } else {
            const {anchor, cursor} = selection;

            let start = anchor.row > cursor.row ? {row: cursor.row, el: cursor.column} :  {row: anchor.row, el: anchor.column};
            let end = anchor.row > cursor.row ?  {row: anchor.row, el: anchor.column} :  {row: cursor.row, el: cursor.column};
            let rSimp = start.row === end.row;
            let cSimp = start.el > end.el;
            let sZone = this.getCursor({document:{$lines:lines}, row: start.row, column: rSimp && cSimp ? end.el : start.el}, (type === 'ul' || type === 'ol') ? 'list' : 'header', true);
            let eZone = this.getCursor({document:{$lines:lines}, row: end.row, column: rSimp && cSimp ? start.el : end.el}, (type === 'ul' || type === 'ol') ? 'list' : 'header', true);
            let tag = type;
            let l = type === 'ol' || type === 'ul';

            if (!l) {
                if (sZone === undefined && eZone === undefined) {
                    lines[start.row] = `<${tag}>${(lines[start.row]+lines.splice(start.row, end.row-start.row).join('')).replace(/<\/?h(1|2|3|4|5|6)>/gmi, '')}</${tag}>`;
                    lines = htmlToText(lines.join(''));
                    onChange(lines)
                }  else {
                    if (sZone === undefined || eZone === undefined) {
                        let _line = (eZone === undefined ? JSON.parse(JSON.stringify(lines)).splice(0, end.row+1) : JSON.parse(JSON.stringify(lines)).splice(0, start.row)).join('');
                        let _lines = JSON.parse(JSON.stringify(lines)).join('').split('').splice((eZone === undefined ? sZone.s : _line.length), (eZone === undefined ? _line.length-sZone.s : eZone.e - _line.length)).join('');
                        let nLine = JSON.parse(JSON.stringify(lines)).join('');

                        let Tag = (sZone || eZone).v.match(/^<h(1|2|3|4|5|6).*?>/gmi)[0].replace(/^<h(1|2|3|4|5|6)/gmi, `<${tag}`);


                        nLine = nLine.replace(_lines, v => `${Tag}${v.replace(/<(h(1|2|3|4|5|6)(\s(?=.).*?)?|\/h(1|2|3|4|5|6))>/gmi, '')}</${tag}>`);
                        nLine = htmlToText(nLine);

                        onChange(nLine)
                    } else if (JSON.stringify(sZone) === JSON.stringify(eZone)) {
                        let _tag = sZone.v[1]+sZone.v[2];
                        let Tag = sZone.v.match(/^<.*?>/gmi)[0];

                        lines = lines.join('').split('');
                        lines.splice(sZone.s, sZone.e-sZone.s, `${_tag === tag ? '' : `${Tag.replace(/^<h(1|2|3|4|5|6)/gmi, `<${tag}`)}`}${sZone.v.replace(/<(h(1|2|3|4|5|6)(\s(?=.).*?)?|\/h(1|2|3|4|5|6))>/gmi, '')}${_tag === tag ? '' : `</${tag}>`}`);
                        lines = htmlToText(lines.join(''));

                        onChange(lines)
                    } else {
                        lines = lines.join('').split('');

                        let _line = JSON.parse(JSON.stringify(lines)).splice(sZone.s, eZone.e-sZone.s).join('');
                        let Tag = sZone.v.match(/^<.*?>/gmi)[0];

                        lines.splice(sZone.s, eZone.e-sZone.s, `${tag === Tag[1]+Tag[2] ? Tag : `<${tag}>`}${_line.replace(/<(h(1|2|3|4|5|6)(\s(?=.).*?)?|\/h(1|2|3|4|5|6))>/gmi, '')}</${tag}>`);
                        lines = htmlToText(lines.join(''));

                        onChange(lines)
                    }
                }
            } else {
                let _start = anchor.row > cursor.row ? cursor.row : anchor.row;
                let _end = anchor.row < cursor.row ? cursor.row : anchor.row;

                if (sZone === undefined && eZone === undefined) {
                    if (_start === _end) {
                        lines[_start] = `<div><${type}><li>` + lines[_start] + `</li></${type}></div>`
                    } else {
                        //console.log('NOW')
                        lines = lines.map((l, i) => {
                            let _line = l;
                            if (i >= _start && i<=_end) {
                                _line = "<li>"+l.replace(/<((u|o)l(\s(?=.).*?)?|\/(u|o)l|li(\s(?=.).*?)?|\/li)>/gmi, '') +"</li>";
                                // console.log(l)
                                // console.log(_line)

                                if (i === _start) {
                                    _line = `<div><${type}>`+_line;
                                } else if (i === _end) {
                                    _line = _line+`</${type}></div>`
                                }
                            }
                            return _line
                        });
                    }

                    onChange(lines.join('\n'))
                } else {
                    if (sZone === undefined || eZone === undefined) {
                        let _tag = sZone === undefined ? eZone.v[1]+eZone.v[2] : sZone.v[1]+sZone.v[2];
                        let _line = (eZone === undefined ? JSON.parse(JSON.stringify(lines)).splice(0, end.row+1) : JSON.parse(JSON.stringify(lines)).splice(0, start.row)).join('');
                        let _lines = JSON.parse(JSON.stringify(lines)).join('').split('').splice((eZone === undefined ? sZone.s : _line.length), (eZone === undefined ? _line.length-sZone.s : eZone.e - _line.length)).join('');
                        let regS = new RegExp(`<${_tag}(\\s(?=.).*?)?>` + `<li(\\s(?=.).*?)?>` + `(<\\w*>)?`, 'gmi');
                        let regE = new RegExp( `(<\/\\w*>)?` + `</li>` + `</${_tag}>`, 'gmi');

                        _lines = _lines.replace(regS, '').replace(regE, '').replace(/<(li(\s(?=.).*?)?|\/li)>/gmi, '');
                        _lines = htmlToText(`${eZone === undefined ? '<div>' : ''}${_lines}${sZone === undefined ? '</div>' : ''}`).split('\n');

                        for (let row of _lines) {
                            _lines[_lines.indexOf(row)] = `<li>${row.replace(/<((u|o)l(\s(?=.).*?)?|\/(u|o)l|li(\s(?=.).*?)?|\/li)>/gmi, '')}</li>`
                        }

                        _lines = `${sZone === undefined ? '<div>' : ''}<${tag}>${_lines.join('\n')}</${tag}>${eZone === undefined ? '</div>' : ''}`;
                        lines = lines.join('').split('');
                        lines.splice((eZone === undefined ? sZone.s : _line.length), (eZone === undefined ? _line.length-sZone.s : eZone.e - _line.length), _lines).join('');
                        lines = htmlToText(lines.join(''));

                        onChange(lines)
                    } else if (JSON.stringify(sZone) === JSON.stringify(eZone)) {
                        let _tag = sZone.v[1]+sZone.v[2];
                        let sPos = JSON.parse(JSON.stringify(lines)).splice(0, start.row).join('').length + start.el;
                        let ePos = JSON.parse(JSON.stringify(lines)).splice(0, end.row).join('').length + end.el;
                        let newList = this.getListPosition(sZone, sPos, _tag, tag, eZone, ePos);

                        lines = lines.join('').split('');
                        lines.splice(sZone.s, sZone.e-sZone.s, newList);
                        lines = lines.join('');
                        lines = htmlToText(lines);

                        onChange(lines)
                    } else {
                        let area = JSON.parse(JSON.stringify(lines)).join('').split('').splice(sZone.e, eZone.s-sZone.e).join('');

                        area = htmlToText(area).split('\n');

                        for (let a of area) {
                            area[area.indexOf(a)] = a.replace(/(<((div|li|ol|ul)(\s(?=.).*?)?|\/(div|li|ol|ul))>)/gmi, '');
                        }

                        area = area.filter(v => v.trim() !== '');

                        let sPos = JSON.parse(JSON.stringify(lines)).splice(0, start.row).join('').length + start.el;
                        let ePos = JSON.parse(JSON.stringify(lines)).splice(0, end.row).join('').length + end.el;
                        let newList = this.makeOneList(sZone, sPos, eZone, ePos, area, tag);

                        lines = lines.join('').split('');
                        lines.splice(sZone.s, eZone.e-sZone.s, newList);
                        lines = htmlToText(lines.join(''));

                        onChange(lines)
                    }
                }
            }

        }
    }

    onSelect = (selected, value) => {
        const {cursor} = this.props;

        let type = this.props.type === 'header' ? 'formatBlock' : (value === 'UL' ? 'insertUnorderedList' : 'insertOrderedList');
        let _value = this.props.type === 'header' ? value : null;

        if (cursor === undefined && !this.props.html) {
            document.execCommand(type, false, _value);
        } else if (cursor !== undefined) {
            this.editHtml(value.toLowerCase())
        }

        this.setState({isOpen: false, selected})
    };

    handleClickOutside() {
        this.resetData();
    };

    resetData = async () => {
        let currentIndex = this.props.data.findIndex(d => d.key === this.state.selected);

        await this.setState({
            hovered: currentIndex === -1 ? '' : this.props.data[currentIndex].key,
            isOpen: false
        });
    };

    setHover = hovered => {
        this.setState({hovered})
    };

    makeIcon(value) {
        if (this.props.type === 'header') {
            return value
        } else {
            let icon = value === 'UL' ? 'list2' : 'list-numbered';

            return <Icon name={icon} size={16}/>
        }
    }

    tag(type) {
        let tag = '';

        if (type === 'header') {
            tag = 'h(1|2|3|4|5|6)';
        } else {
            tag = '(o|u)l';
        }

        return tag
    }

    makeOneList(sZone, sPos, eZone, ePos, area, tag) {
        let sTag = sZone.v[1]+sZone.v[2];
        let eTag = eZone.v[1]+eZone.v[2];
        let sMatch = sZone.v.match(/<li>.*?<\/li>/gmi);
        let eMatch = eZone.v.match(/<li>.*?<\/li>/gmi);

        if (sMatch === null || eMatch === null) {
            return sZone.v+`<div>${area.join('')}</div>` + eZone.v
        }

        let sZones = [];
        let eZones = [];

        for (let match of sMatch) {
            let _zones = sZones.filter(z => z.v === match);

            if (_zones.length === 0) {
                sZones.push({s: sZone.v.indexOf(match), e: sZone.v.indexOf(match)+match.length, v: match})
            } else {
                sZones.push({s: sZone.v.indexOf(match, _zones[_zones.length-1].e), e: sZone.v.indexOf(match, _zones[_zones.length-1].e)+match.length, v: match})
            }
        }

        for (let match of eMatch) {
            let _zones = eZones.filter(z => z.v === match);

            if (_zones.length === 0) {
                eZones.push({s: eZone.v.indexOf(match), e: eZone.v.indexOf(match)+match.length, v: match})
            } else {
                eZones.push({s: eZone.v.indexOf(match, _zones[_zones.length-1].e), e: eZone.v.indexOf(match, _zones[_zones.length-1].e)+match.length, v: match})
            }
        }

        for (let z of sZones) {
            z.s += sZone.s;
            z.e += sZone.s
        }
        for (let z of eZones) {
            z.s += eZone.s;
            z.e += eZone.s
        }

        let sameSTag = sTag === tag;
        let sameETag = eTag === tag;
        let sArea = sZones.find(z => z.s<sPos && sPos <z.e);
        let eArea = eZones.find(z => z.s<ePos && ePos <z.e);
        let si = sZones.indexOf(sArea);
        let ei = eZones.indexOf(eArea);

        sZones[si].v = `${!sameSTag && si !== 0? `</${sTag}></div><div><${tag}>` : ''}<li><div>` +
            sArea.v.replace(/(<\/?(div|li|ol|ul).*?>)/gmi, '') + `</div></li>`;
        eZones[ei].v = `<li><div>` +
            eArea.v.replace(/(<\/?(div|li|ol|ul).*?>)/gmi, '') + `</div></li>${!sameETag && ei !== eZones.length-1 ? `</${tag}></div><div><${eTag}>` : ''}`;

        return `<${!sameSTag && si !== 0 ? sTag : tag}>` + sZones.map(z => z.v).join('') + area.map(a => `<li><div>${a}</div></li>`).join('') + eZones.map(z => z.v).join('') + `</${!sameETag && ei !== sZones.length-1 ? eTag : tag}>`
    }

    getListPosition(_zone, pos, _tag, tag, eZone, ePos) {
        let matches = _zone.v.match(/<li(\s(?=.).*?)?>.*?<\/li>/gmi);

        if (matches !== null) {
            let zones = [];

            for (let match of matches) {
                let __zones = zones.filter(z => z.v === match);

                if (__zones.length === 0) {
                    zones.push({s: _zone.v.indexOf(match), e: _zone.v.indexOf(match)+match.length, v: match})
                } else {
                    zones.push({s: _zone.v.indexOf(match, __zones[__zones.length-1].e), e: _zone.v.indexOf(match, __zones[__zones.length-1].e)+match.length, v: match})
                }
            }

            zones[0].v = `<${_tag}>`+zones[0].v;
            zones[zones.length-1].v = zones[zones.length-1].v+`</${_tag}>`;

            for (let z of zones) {
                z.s += _zone.s;
                z.e += _zone.s
            }

            let sameTag = _tag === tag;
            let reg = new RegExp(`<(${_tag}(\\s(?=.).*?)?|\/${_tag}|li(\\s(?=.).*?)?|\/li)>`, 'gmi');

            if (zones.length > 1) {
                let area = zones.find(z => z.s<pos && pos<z.e);
                let area2 = zones.find(z => z.s<ePos && ePos<z.e);
                let i = zones.indexOf(area);
                let i2 = zones.indexOf(area2);

                if (area2 && i2 !== -1 && i !== i2) {
                    if (i !== 0 && i2 !== zones.length-1) {
                        zones[i].v = `${i === 0 ? '' : `</${_tag}></div>`}${sameTag ? "" : `<div><${tag}><li>`}${i === 0 && sameTag ? '' : `<div>`}`+
                            area.v.replace(reg, '').replace(/(^<div(\s(?=.).*?)?>)|(<\/div>$)/gmi, '') +
                            `${i === zones.length-1 && sameTag ? '' : `</div>`}${sameTag ? "" : `</li></${tag}></div>`}${i === zones.length-1 ? '' : `<div><${_tag}>`}`;
                        zones[i2].v = `${i2 === 0 ? '' : `</${_tag}></div>`}${sameTag ? "" : `<div><${tag}><li>`}${i2 === 0 && sameTag ? '' : `<div>`}`+
                            area.v.replace(reg, '').replace(/(^<div(\s(?=.).*?)?>)|(<\/div>$)/gmi, '') +
                            `${i2 === zones.length-1 && sameTag ? '' : `</div>`}${sameTag ? "" : `</li></${tag}></div>`}${i2 === zones.length-1 ? '' : `<div><${_tag}>`}`;

                        for (let zone of zones) {
                            let _i = zones.indexOf(zone);

                            if (i <  _i && _i < i2) {
                                zones[_i] = zone.replace(/<li(\s(?=.).*?)?>(<div(\s(?=.).*?)?>)?/gmi, '<div>').replace(/(<\/div>)?<\/li>/gmi, '</div>').replace(/<((o|u)l(\s(?=.).*?)?|\/(o|u)l)>/gmi, '')
                            }
                        }
                    } else {
                        zones = zones.map((z, i) => {
                            if (sameTag) {
                                z.v = z.v.replace(/<((o|u)l(\s(?=.).*?)?|\/(o|u)l)>/gmi, '').replace(/<li(\s(?=.).*?)?>(<div(\s(?=.).*?)?>)?/gmi, (i === 0 ? '' : '<div>')).replace(/(<\/div>)?<\/li>/gmi, (i === zones.length-1 ? '' : '</div>'));
                            } else if (i === 0 || i === zones.length-1) {
                                z.v = z.v.replace(/(<(o|u)l(\s(?=.).*?)?>)/gmi, `<${tag}>`).replace(/(<\/(o|u)l>)/gmi, `</${tag}>`)
                            }

                            return z
                        })
                    }
                } else {
                    area.v = `${i === 0 ? '' : `</${_tag}></div>`}${sameTag ? "" : `<div><${tag}><li>`}${i === 0 && sameTag ? '' : `<div>`}`+
                        area.v.replace(reg, '').replace(/(^<div(\s(?=.).*?)?>)|(<\/div>$)/gmi, '') +
                        `${i === zones.length-1 && sameTag ? '' : `</div>`}${sameTag ? "" : `</li></${tag}></div>`}${i === zones.length-1 ? '' : `<div><${_tag}>`}`;
                }
            } else {
                zones[0].v = `${sameTag ? '' : `<${tag}><li><div>`}`+zones[0].v.replace(reg, '').replace(/(^<div(\s(?=.).*?)?>)|(<\/div>$)/gmi, '')+`${sameTag ? '' : `</div></li></${tag}>`}`
            }

            zones = zones.map(z => z.v);

            return zones.join('')
        }

        return _zone.v
    }

    getCursor(cursor, type, action) {
        if (cursor !== undefined) {
            const {document, row, column} = cursor;

            let tag = this.tag(type);
            let lines = document.$lines.join('');
            let _lineBefore = JSON.parse(JSON.stringify(document.$lines)).splice(0, row).join('').length;
            let _column = column+_lineBefore;
            let reg = new RegExp(`<${tag}(\\s(?=.).*?)?>` +'.*?'+ `</${tag}>`, 'gmi');
            let mathes = lines.match(reg);

            if (mathes !== null) {
                let zones = [];

                for (let match of mathes) {
                    let _zones = zones.filter(z => z.v === match);

                    if (_zones.length === 0) {
                        zones.push({s: lines.indexOf(match), e: lines.indexOf(match)+match.length, v: match})
                    } else {
                        zones.push({s: lines.indexOf(match, _zones[_zones.length-1].e), e: lines.indexOf(match, _zones[_zones.length-1].e)+match.length, v: match})
                    }
                }

                let exist = zones.some(z => z.s<_column && _column<z.e);

                return action ? zones.find(z => z.s<_column && _column<z.e) : exist
            }
        }
    }

    render() {
        const {selected, isOpen, hovered} = this.state;
        const {showArrow, data, width, height, type, cursor, titles} = this.props;

        let exist = this.getCursor(cursor, type);
        let clicked =
            exist ||
            (type === 'list' &&
            (document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList'))) ||
            (type === 'header' && this.props.data.some(o => o.value ===  document.queryCommandValue('formatBlock').toUpperCase()));

        return selected===null ? null :
                <div className={`text-editor-button -selector${isOpen ? " --open" : ""}${clicked ? ' -clicked' : ''}`}
                     style={{width, height}}
                     ref={selector => this.selector = selector}
                     onClick={this.toggle}
                     title={(titles || {})[type]}
                >
                    <div className={`-button`}>
                            <div className="-text" >{
                                selected === null ?
                                    "" :
                                    this.makeIcon(data.find(d => d.key === selected).value)
                            }</div>
                        { showArrow === false ? null :
                            <Arrow color={'black'} size={4} onClick={() => this.toggle(true)}/>
                        }
                    </div>
                    <div className="-menu" ref={container => this.container = container} style={{width}}>
                        { data === null ? null :
                            data.map(d => (
                                <div key={d.key} className={`-item${selected === d.key ? " --selected" : ""}${hovered === d.key ? " --hovered" : ""}`}
                                     onClick={() => this.onSelect(d.key, d.value)} onMouseEnter={() => this.setHover(d.key)}
                                     //ref={item => this.items[d.key] = item}
                                >
                                    {this.makeIcon(d.value)}
                                </div>
                            ))
                        }
                    </div>
                </div>
    }

}

const Arrow = props => {
    const {color, size, onClick} = props;
    return <div className='-triangle' onClick={onClick} style={{
        borderTopColor: color === undefined ? "black" : color,
        borderWidth: size === undefined ? "8px 8px 0 8px" : `${size}px ${size}px 0 ${size}px`
    }}/>
};

export default onClickOutside(Selector);