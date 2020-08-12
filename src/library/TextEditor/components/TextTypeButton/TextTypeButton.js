import React, {Component} from "react";
import PropTypes from 'prop-types';
import './styles.scss'
import Icon from "../Icon";
import htmlToText from "../../utils/htmlToText";
import ColorPicker from "../ColorPicker/ColorPicker";
import {rgbToHex} from "../../utils/rgbConverter";

export default class TextTypeButton extends Component{

    static propTypes = {
        type: PropTypes.string,
        editor: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
        disabled: PropTypes.bool,
        modalMessage: PropTypes.func
    };

    state={
        updated: new Date().getTime(),
        foreColor: false,
        hiliteColor: false,
        changeColorFunc: null
    };

    componentDidMount() {
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

    createLink(v, cursor, selection, lines, onChange){

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
            let sZone = this.getCursor({document:{$lines:lines}, row: start.row, column: rSimp && cSimp ? end.el : start.el}, 'a', true);
            let eZone = this.getCursor({document:{$lines:lines}, row: end.row, column: rSimp && cSimp ? start.el : end.el}, 'a', true);
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
        this.props.cleanModalMessage()
    }


    htmlEdit(type, p){
        const {cursor, urlMessage, onChange, selection} = this.props;

        let lines = JSON.parse(JSON.stringify(cursor.document.$lines));

        if(type === 'createlink'){
            let sZone, eZone;

            if(selection === undefined){
                sZone = this.getCursor(cursor, 'a', true)
            } else {
                const {anchor, cursor} = selection;
                let start = anchor.row > cursor.row ? {row: cursor.row, el: cursor.column} :  {row: anchor.row, el: anchor.column};
                let end = anchor.row > cursor.row ?  {row: anchor.row, el: anchor.column} :  {row: cursor.row, el: cursor.column};
                let rSimp = start.row === end.row;
                let cSimp = start.el > end.el;
                sZone = this.getCursor({document:{$lines:lines}, row: start.row, column: rSimp && cSimp ? end.el : start.el}, 'a', true);
                eZone = this.getCursor({document:{$lines:lines}, row: end.row, column: rSimp && cSimp ? start.el : end.el}, 'a', true);
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
                this.props.modalMessage({modalVisible: true, title: urlMessage, modalType: 'input', modalFunction: async v => this.createLink(v, cursor, selection, lines, onChange)})
            }
        } else {
            if(selection === undefined){
                // console.log(1)
                let zone = this.getCursor(cursor, type, true);
                let row = cursor.row;
                let _lineBefore = JSON.parse(JSON.stringify(lines)).splice(0, row).join('').length;
                let el = cursor.column+_lineBefore;
                let line = lines.join('').split('');
                let tag = this.tag(type);

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
                //console.log(2)
                const {anchor, cursor} = selection;
                let start = anchor.row > cursor.row ? {row: cursor.row, el: cursor.column} :  {row: anchor.row, el: anchor.column};
                let end = anchor.row > cursor.row ?  {row: anchor.row, el: anchor.column} :  {row: cursor.row, el: cursor.column};
                let tag = this.tag(type);
                if(tag !== ''){
                    let rSimp = start.row === end.row;
                    let cSimp = start.el > end.el;
                    let sZone = this.getCursor({document:{$lines:lines}, row: start.row, column: rSimp && cSimp ? end.el : start.el}, type, true);
                    let eZone = this.getCursor({document:{$lines:lines}, row: end.row, column: rSimp && cSimp ? start.el : end.el}, type, true);
                    let _lineBeforeS = JSON.parse(JSON.stringify(lines)).splice(0, start.row).join('').length;
                    let _lineBeforeE = JSON.parse(JSON.stringify(lines)).splice(0, end.row).join('').length;
                    start.el = start.el+_lineBeforeS;
                    end.el = end.el + _lineBeforeE;
                    lines = lines.join('').split('');
                    let a = start.el < end.el;

                    if(sZone === undefined && eZone === undefined) {
                            let str = lines.splice((a ? start.el : end.el), Math.abs(start.el - end.el));
                            let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');
                            lines.splice(a ? start.el : end.el, 0, `<${tag}>${str.join('').replace(reg, '')}</${tag}>`)
                    } else {
                        if(sZone === undefined || eZone === undefined){
                            let str = sZone === undefined ? lines.splice((a ? start.el : end.el), eZone.e - (a ? start.el : end.el)) : lines.splice(sZone.s, (!a ? start.el : end.el)-sZone.s);
                            let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');
                            let _reg = new RegExp(`^<${tag}(\\s(?=.).*?)?>`, 'gmi');
                            let _tag = (sZone === undefined ?eZone:sZone).v.match(_reg) || [`<${tag}>`];
                            lines.splice((sZone === undefined ? (a ? start.el : end.el) : sZone.s), 0, `${_tag[0]}${str.join('').replace(reg, '')}</${tag}>`)
                        } else if(JSON.stringify({...sZone, c: undefined}) === JSON.stringify({...eZone, c: undefined})){
                            let str = JSON.parse(JSON.stringify(lines)).splice((a ? start.el : end.el), Math.abs(start.el - end.el));
                            let check = sZone.v.replace(str.join(''), '');
                            let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');
                            let _reg = new RegExp(`^<${tag}(\\s(?=.).*?)?>`, 'gmi');
                            let _tag = sZone.v.match(_reg) || [`<${tag}>`];
                            if(check.length <= `${_tag[0]}</${tag}>`.length){
                                let _str = sZone.v.replace(/(^<.*?>)|(<\/.*?>$)/gmi, '');
                                lines.splice(sZone.s, sZone.v.length, `${_str}`)
                            }else {
                                lines.splice(a ? start.el : end.el, 0, `</${tag}>${str.join('').replace(reg, '')}${_tag[0]}`)
                            }
                        } else {
                            let str = JSON.parse(JSON.stringify(lines)).splice(sZone.s, eZone.e-sZone.s);
                            let reg = new RegExp(`<\/?${tag}(\\s(?=.).*?)?>`, 'gmi');
                            lines.splice(sZone.s, eZone.e-sZone.s, `<${tag}>${str.join('').replace(reg, '')}</${tag}>`)
                        }
                    }
                    lines = lines.join('');
                    lines = htmlToText(lines);
                    onChange(lines)
                }

            }
        }
    }

    onClick(type, editor, param){
        const {urlMessage, cursor, notChosen} = this.props;
        let _editor = document.getElementsByClassName('text-editor')[0];

        if(type === 'createlink'){

            if (cursor === undefined) {
                const {anchorNode, anchorOffset, focusNode, focusOffset} = document.getSelection();
                const str = document.getSelection().toString();

                //if (str !== undefined && str.trim() !== '') {
                    let parent = anchorNode.parentElement.offsetParent.outerText;
                    let link = anchorNode.parentElement.href;
                    let anchor = anchorNode.data;
                    let focus = focusNode.data;

                if ((str !== undefined && str.trim() !== '') || link) {
                    //console.log(link);

                    this.props.modalMessage({modalVisible: true, link, title: urlMessage, modalType: 'input', modalFunction: async v => {
                            //if(anchorNode === focusNode){
                            let rng = document.createRange();
                            let start = link ? 0 : anchorOffset;
                            let end = link ? anchorNode.length : focusOffset;
                            let _anchorNode = anchorNode;
                            let _focusNode = focusNode;

                            if (anchorNode === focusNode) {
                                //console.log('_check');
                                end = anchorOffset < focusOffset ? focusOffset : anchorOffset;
                                start = anchorOffset > focusOffset ? focusOffset : anchorOffset;
                            } else if (parent.indexOf(focus) < parent.indexOf(anchor)) {
                                _focusNode = anchorNode;
                                _anchorNode = focusNode;
                                end = anchorOffset;
                                start = focusOffset
                            }

                            if ( link ) {
                                start = 0;
                                end = anchorNode.length
                            }

                            //if (link === undefined) {
                                rng.setStart(_anchorNode, start);
                                rng.setEnd(_focusNode, end);
                                _editor = window.getSelection();
                                _editor.removeAllRanges();
                                _editor.addRange(rng);

                                if (v.match(/^http/gmi)) {
                                    document.execCommand(
                                        'insertHTML',
                                        false,
                                        `<a href="${v}" target="_blank">${str}</a>`
                                    );
                                } else {
                                    document.execCommand(type, false, v);
                                }



                            // } else {
                            //
                            // }



                            this.props.cleanModalMessage()
                    }});

                    setTimeout(() => {
                        let input = document.getElementsByClassName('TextEditor')[0].getElementsByClassName('modal')[0];

                        if (input !== undefined) {
                            input = input.getElementsByTagName('input')[0];
                            if (input !== undefined) {
                                input.focus()
                            }
                        }
                    }, 0)
                } else {
                    this.props.modalMessage({modalVisible: true, modalMessage: notChosen, modalType: 'alert'})
                }
            } else {
                this.htmlEdit(type)
            }
        } else {
            if (cursor === undefined && !this.props.html) {
                console.log(1)
                let selection = window.getSelection();

                const {anchorNode, anchorOffset, focusNode, focusOffset} = window.getSelection();
                const _type = selection.type;

                if (type === 'foreColor' || type === 'hiliteColor') {
                    this.setState({[type]: !this.state[type],
                        changeColorFunc: this.state.changeColorFunc ? null : (p) =>
                            this.buttonFunc(_editor, type, p, {
                                anchorNode,
                                anchorOffset,
                                focusNode,
                                focusOffset,
                                type: _type
                            })})
                } else {
                    this.buttonFunc(_editor, type, param, selection)
                }
            } else if (cursor !== undefined) {
                if (type === 'foreColor') {
                    type = 'font';
                    this.setState({foreColor: !this.state.foreColor,
                        changeColorFunc: this.state.changeColorFunc ? null : (p) => this.htmlEdit(type, p)})
                } else {
                    this.htmlEdit(type)
                }

            }
        }
    };

    buttonFunc(_editor, type, param, selection) {
        let rng = document.createRange();

        if (type === 'formatblock') {
            if (selection.anchorNode.parentElement.tagName === param.toUpperCase()) {
                param = 'div'
            }
        }

        if (selection.type === 'Caret') {
            rng.setStart(selection.anchorNode, selection.anchorOffset);
            _editor.focus();
            _editor = window.getSelection();
            _editor.removeAllRanges();
            _editor.addRange(rng);
        } else if (type === 'foreColor' || type === 'hiliteColor') {
            if (selection.anchorNode !== null && selection.focusNode !== null) {
                const {anchorNode, focusNode, anchorOffset, focusOffset} = selection;

                let parent = anchorNode.parentElement.offsetParent.outerText;
                let _anchorNode = anchorNode;
                let _focusNode = focusNode;
                let anchor = anchorNode.data;
                let focus = focusNode.data;
                let end, start;

                if (anchorNode === focusNode) {
                    //console.log('_check');
                    end = anchorOffset < focusOffset ? focusOffset : anchorOffset;
                    start = anchorOffset > focusOffset ? focusOffset : anchorOffset;
                } else if (parent.indexOf(focus) < parent.indexOf(anchor)) {
                    _focusNode = anchorNode;
                    _anchorNode = focusNode;
                    end = anchorOffset;
                    start = focusOffset
                }

                rng.setStart(_anchorNode, start);
                rng.setEnd(_focusNode, end);
                _editor = window.getSelection();
                _editor.removeAllRanges();
                _editor.addRange(rng);
            }
        }
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(type, false, param);
    }


    tag(type){
        let tag = '';
        switch (type) {
            case 'font':
                tag = 'font';
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
    }

    buttonLogo(type){
        let color = 'black';
        let icon = '';

        if (type === 'foreColor' || type === 'hiliteColor') {
            color = rgbToHex(document.queryCommandValue(type === 'hiliteColor' ? 'BackColor' : type))
        }

        switch (type) {
            case 'foreColor':
                //icon = 'font-color';
                return (
                    <div className={'foreColor'}>
                        <div>A</div>
                        <div style={{backgroundColor: color}}>
                        </div>
                    </div>
                );
            case 'hiliteColor':
                //icon = 'fill-color';
                return (
                    <div className={'hiliteColor'}>
                        <div><Icon name={'color_fill'} size={18} color={'black'}/></div>
                        <div style={{backgroundColor: color}}>
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
    }

    getCursor(cursor, type, action){
        if(cursor !== undefined){
            const {document, row, column} = cursor;
            let tag = this.tag(type);
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
    }

    onChoose = async (color) => {
        const {cursor} = this.props;

        if (color) {
            const {changeColorFunc} = this.state;
            await changeColorFunc(cursor ? `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` : color.hex);
        }

        this.setState({[this.props.type]: false});
        this.setState({changeColorFunc: null})
    };

    render() {
        const {width, height, type, editor, param, disabled, cursor, titles} = this.props;

        let blockquote = document.queryCommandValue('formatBlock') === 'blockquote';
        let exist = this.getCursor(cursor, type);

        return (
                <div
                    className={
                        `text-editor-button${
                        document.queryCommandState(type) ||
                        exist ||
                        (type === 'formatblock' && blockquote) ||
                        (type === 'createlink' && cursor===undefined && document.getSelection().anchorOffset === document.getSelection().extentOffset
                        ) ?
                        ' -clicked' : ''}${disabled ? ' -disabled' : ''}`
                    }
                    style={{width, height}}
                    title={(titles || {})[type]}
                >
                    <div className='ted-div'  onClick={() => this.onClick(type, editor, param)}>
                        {
                            this.buttonLogo(type)
                        }
                    </div>
                    <ColorPicker cursor={cursor} type={type} open={this.state[type]} onChoose={color => this.onChoose(color, type)}
                                 color={type === 'foreColor' || type === 'hiliteColor' ? document.queryCommandValue(type === 'hiliteColor' ? 'BackColor' : type) : undefined}
                    />
                </div>
        )
    }
}