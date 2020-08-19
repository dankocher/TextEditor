import React, {Component} from "react";
import PropTypes from 'prop-types';
import './styles.scss'
import ColorPicker from "../ColorPicker/ColorPicker";
import {htmlEdit, getCursor, createLink, buttonLogo} from "../../helpers";

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
        createLink(v, cursor, selection, lines, onChange, this.props)
    }

    htmlEdit(type, p, typeColor){
        htmlEdit(type, p, typeColor, this.props)
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
                //console.log(1)
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
                //console.log(type)
                if (type === 'foreColor' || type === 'hiliteColor') {
                    let _type = type === 'foreColor' ? 'font' : 'span';
                    this.setState({[type]: !this.state[type],
                        changeColorFunc: this.state.changeColorFunc ? null : (p) => this.htmlEdit(_type, p, type)})
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
            console.log(selection)
            if (selection.anchorNode !== null && selection.focusNode !== null) {
                //console.log()
                const {anchorNode, focusNode, anchorOffset, focusOffset} = selection;

                let parent = anchorNode.parentElement.offsetParent.outerText;
                let _anchorNode = anchorNode;
                let _focusNode = focusNode;
                let anchor = anchorNode.data;
                let focus = focusNode.data;
                let end, start;
                //
                console.log('anc', anchorNode)
                console.log('focus', focusNode)
                console.log('_focus', parent.indexOf(focus))
                console.log('_anc', parent.indexOf(anchor))

                // if (anchorNode === focusNode) {
                //     console.log('_check');
                //     end = anchorOffset < focusOffset ? focusOffset : anchorOffset;
                //     start = anchorOffset > focusOffset ? focusOffset : anchorOffset;
                // } else
                if (parent.indexOf(focus) < parent.indexOf(anchor)) {
                    console.log('_check2');
                    _focusNode = anchorNode;
                    _anchorNode = focusNode;
                    end = anchorOffset;
                    start = focusOffset
                } else {
                    end = anchorOffset < focusOffset ? focusOffset : anchorOffset;
                    start = anchorOffset > focusOffset ? focusOffset : anchorOffset;
                }

                rng.setStart(_anchorNode, start);
                rng.setEnd(_focusNode, end);
                _editor = window.getSelection();
                _editor.removeAllRanges();
                _editor.addRange(rng);
            }
        }
        console.log(type, param)
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(type, false, param);
    }

    buttonLogo(type){
        return buttonLogo(type)
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
        let exist = getCursor(cursor, type);
        //console.log(this.state)
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