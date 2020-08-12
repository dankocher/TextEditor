import React from 'react';
import PropTypes from 'prop-types';
import {normalizeHtml, htmlToText} from './utils';

import './styles.scss';
import TextTypeButton from "./components/TextTypeButton/TextTypeButton";
import PictureInput from "./components/PictureInput/PictureInput";
import Selector from "./components/Selector/Selector";
import {header, list} from "./constants/constants";
import Modal from "./Modal/Modal";
import Icon from "./components/Icon";
import shortenPicSrc from "./utils/shortenPicSrc";
import ContentEditable from "react-contenteditable";
import HtmlEditor from './components/htmlEditor/HtmlEditor'

import PictureMenu from "./components/PictureInput/PictureMenu/PictureMenu";

// import 'brace';
// import 'brace/mode/html';
// import 'brace/theme/chrome';


const _width = 38, _height=34;

class TextEditor extends React.Component {

    static propTypes = {
        html: PropTypes.string.isRequired,
        onChange: PropTypes.func,
        onBlur: PropTypes.func,
        onKeyUp: PropTypes.func,
        onKeyDown: PropTypes.func,
        disabled: PropTypes.bool,
        width: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]).isRequired,
        height: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]).isRequired,
        show: PropTypes.string
    };

    state = {
        selected: null,
        html: '',
        text: '',
        normalizedHtml: '',
        htmlEditor: 'hide', //hide|show|only
        textFocused: false,
        modalVisible: false,
        modalMessage: '',
        modalType: '',
        modalFunction: null
    };

    // shouldComponentUpdate(nextProps, nextState, nextContext) {
    //     //console.log('t', this.props.html, 'n', nextProps.html)
    //     return !this.state.textFocused
    // }

    componentDidMount() {
        //console.log('MOUNT')
        //this.lastHtml = this.props.html === '' ? '<div class=\'blog-paragraph\'>' + ' ' + '</div>' : this.props.html;
        this.lastHtml = this.props.html;
        //console.log(this.lastHtml)
        this.setState({html: this.lastHtml, text: htmlToText(shortenPicSrc(this.lastHtml)), normalizedHtml: this.props.html, htmlEditor: this.props.show || 'hide'});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('componentDidUpdate')

        if(this.props.clean){
            //console.log('update')
            //console.log(document)
            //let editor = document.getElementsByClassName('__TextEditor')[0];
            // document.execCommand('selectAll');
            // document.execCommand('delete');
            // document.execCommand('delete');
            // document.execCommand('insertHtml', false, this.props.html);

            this.lastHtml = this.props.html;
            this.setState({html: this.lastHtml, text: this.lastHtml, normalizedHtml:  this.lastHtml, updated: new Date().getTime()});
            this.props.cleaned()
        }

        if (prevProps.editLang !== this.props.editLang) {
            //console.log('update_lang')
            this.lastHtml = this.props.html;
            this.setState({html: this.lastHtml, text: htmlToText(shortenPicSrc(this.lastHtml)), normalizedHtml: this.props.html});
        }
    }


    handleChange = evt => {
        // console.log(this.props.html)
        // console.log(evt.target.value )
        // console.log(normalizeHtml(this.state.html))

        this.props.onChange(evt);

        this.setState({html: evt.target.value, text: htmlToText( evt.target.value), updated: new Date().getTime()});
    };

    onChangeHtml = e => {

        let normalizedHtml = e.target.value;

        normalizedHtml = normalizedHtml.replace(/<\/\w*>\n*?</gmi, v => {
            //console.log(1,v)
            return v.replace(/>\n</gmi, '><')
        }).replace(/<\w*>\n*<\w*>/gmi, s => {
            //console.log(2, s)
            return s.replace(/>\n*</gmi, '><')
        });

        //console.log(normalizedHtml)
        this.setState({html: normalizedHtml, text: e.target.value});
        if (this.props.onChange) {
           this.props.onChange({target: {value: normalizedHtml}});
        }
    };

    onChangePicture = async (img) => {
        const {html} = this.state;

        if (!document.execCommand('insertHtml', false, '')) {
            this.setState({html: html+img})
        } else {
            document.execCommand('insertHtml', false, img);
        }


        //this.setState({html: normalizeHtml(this.state.html)})
    };

    onFocusText = () => {
        //console.log('FOCUS')
        this.setState({
            textFocused: true});
    };

    onBlurText = () => {
        //console.log('BLUR')
        this.setState({textFocused: false});
        // this.emitChange();
    };

    htmlSwitch(){
        let type = '';
        switch (this.state.htmlEditor) {
            case 'hide':
                type = 'show';
                break;
            case 'show':
                type = 'only';
                break;
            case 'only':
                type = 'hide';
                break;
            default:
                break
        }

        this.setState({htmlEditor: type})
    }

    position;

    showImageMenu = async (click) => {
        // let caret = window.getSelection();
        // this.position = {node: caret.anchorNode, pos: caret.anchorOffset};
        // this.setState({updated: new Date().getTime()});
        if(click.target.localName === 'img' && click.target.attributes.float !== undefined){
            //console.log(click.target.attributes.float)
            //console.log([click.target])
            let editor = document.getElementsByClassName('text-editor')[0];
            let x = click.target.offsetLeft+(click.target.clientWidth/2)-50-editor.scrollLeft;
            let y = click.target.offsetTop-editor.scrollTop;
            // console.log(x, y)
            if(y >=40){
                this.setState({menu: {x: x, y: y, target: click.target}})
            }
        } else {
            if(this.state.menu !== undefined){
                this.setState({menu: undefined})
            }

            // let rng = document.createRange();
            //
            // rng.setStart(this.position.node, this.position.pos);
            // let editor = window.getSelection();
            // editor.removeAllRanges();
            // editor.addRange(rng);
        }
    };

    selectionHtml = s => {
        const {$isEmpty, anchor, cursor} = s;

        if(!$isEmpty && (anchor.row !== cursor.row || anchor.column !== cursor.column)){
            this.setState({selection: s})
        } else if (this.state.selection !== undefined) {
            this.setState({selection: undefined})
        }
    };

    makeHtmlEditorHeight(height) {
        const {htmlEditor} = this.state;
        switch (htmlEditor) {
            case 'only':
                return `${height - 40}px`;
            case 'show':
                return `${(height-40)/2}px`;
            default:
                break
        }
    }

    render() {

        const {width, height, acceptText, onePictureMessage, incorrectPicture, protocol, urlMessage, notChosen, translations, titles} = this.props;
        const {htmlEditor, text, textFocused, html, normalizedHtml, modalVisible, modalMessage, modalType, modalFunction, title, menu, cursor, selection, link} = this.state;

        //console.log(this.state.html)
        return (
            <div className={`TextEditor html-${htmlEditor}`} style={{width, height}}>
                <div className="-tools">
                    <Selector
                        type={'header'}
                        editor={this.el}
                        updated={this.updated}
                        titles={titles}
                        width={102}
                        height={_height}
                        data={header}
                        cursor={textFocused ? cursor : undefined}
                        html={this.state.htmlEditor === 'only'}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'foreColor'}
                        editor={this.el}
                        titles={titles}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'hiliteColor'}
                        editor={this.el}
                        titles={titles}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'bold'}
                        editor={this.el}
                        titles={titles}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'italic'}
                        titles={titles}
                        editor={this.el}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'underline'}
                        titles={titles}
                        editor={this.el}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'strikeThrough'}
                        titles={titles}
                        editor={this.el}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'formatblock'}
                        titles={titles}
                        param={'blockquote'}
                        editor={this.el}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <Selector
                        type={'list'}
                        titles={titles}
                        editor={this.el}
                        updated={this.updated}
                        html={this.state.htmlEditor === 'only'}
                        width={44}
                        height={_height}
                        data={list}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <TextTypeButton
                        type={'justifyLeft'}
                        titles={titles}
                        editor={this.el}
                        updated={this.updated}
                        disabled={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                    />
                    <TextTypeButton
                        type={'justifyCenter'}
                        titles={titles}
                        editor={this.el}
                        updated={this.updated}
                        disabled={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                    />
                    <TextTypeButton
                        type={'justifyRight'}
                        titles={titles}
                        editor={this.el}
                        updated={this.updated}
                        disabled={this.state.htmlEditor === 'only'}
                        width={_width}
                        height={_height}
                        cursor={textFocused ? cursor : undefined}
                    />
                    <TextTypeButton
                        type={'createlink'}
                        titles={titles}
                        html={this.state.htmlEditor === 'only'}
                        editor={this.el}
                        updated={this.updated}
                        width={_width}
                        height={_height}
                        protocol={protocol}
                        urlMessage={urlMessage}
                        notChosen={notChosen}
                        modalMessage={v => this.setState(v)}
                        cleanModalMessage={() => this.setState({modalVisible: false, modalMessage: '', link: undefined, modalFunction: null, modalType: ''})}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        selection={selection}
                        onChange={v => this.onChangeHtml({target:{value:v}})}
                    />
                    <PictureInput
                        title={(titles || {}).pictureInput}
                        width={_width}
                        height={_height}
                        saveLabel={(translations || {}).saveLabel}
                        cancelLabel={(translations || {}).cancelLabel}
                        html={this.state.htmlEditor === 'only'}
                        onePictureMessage={onePictureMessage}
                        incorrectPicture={incorrectPicture}
                        onClick={v => this.onChangePicture(v)}
                        modalMessage={v => this.setState(v)}
                        cursor={textFocused ? cursor : undefined}
                        text={text}
                        onChange={v => this.onChangeHtml({target:{value:v}}, true)}
                    />
                    <div className={`text-editor-button -html-switcher -${htmlEditor}`} title={(titles || {}).switcher} style={{width: _width, height: _height}} onClick={() => this.htmlSwitch()}>
                        <Icon name={'embed'} size={20}/>
                    </div>
                </div>
                <ContentEditable
                    //innerRef={this.contentEditable}
                    style={{overflow: 'overlay'}}
                    html={normalizeHtml(this.state.html)} // innerHTML of the editable div
                    disabled={false}       // use true to disable editing
                    onChange={this.handleChange} // handle innerHTML change
                    onFocus={this.onBlurText}
                    onClick={v => this.showImageMenu(v)}
                    tagName='div' // Use a custom HTML tag (uses a div by default)
                    className='text-editor'
                />
                <HtmlEditor
                    html={text}
                    height={this.makeHtmlEditorHeight(height)}
                    onChange={this.onChangeHtml}
                    cursorPosition={v => {
                        if (JSON.stringify(v.lead) !== JSON.stringify(cursor)) {
                            this.setState({cursor: v.lead})
                        }
                    }}
                    selectionHtml={this.selectionHtml}
                    onFocus={this.onFocusText}
                />
                {
                    menu === undefined ? null :
                        <PictureMenu
                            menu={menu}
                            html={html}
                            setHtml={v => this.setState({html: v, menu: undefined})}
                        />
                }
                <Modal
                    visible={modalVisible}
                    message={modalMessage}
                    acceptText={acceptText || (translations || {}).acceptText}
                    cancelText={modalType === 'alert' ? undefined : (translations || {}).cancelText}
                    defaultValue={protocol}
                    title={title}
                    link={link}
                    isWarning={true}
                    type={modalType}
                    onConfirm={modalFunction}
                    onCancel={() => this.setState({modalVisible: false, modalMessage: '', link: undefined, modalFunction: null, modalType: ''})}
                />
            </div>
        )
    }
}

export default TextEditor;

// const addLF = value => {
//     return '<div class="blog-article-content">' + value.replace(/</gmi, '\n  <').replace(/>/gmi, '>    \n') + '</div>'
// };
//
// const removeLF = value => {
//     return value.replace(/\n  </gmi, '<').replace(/>  \n/gmi, '>').replace('<div class="blog-article-content">', '').replace(/<\/div>$/, '');
// };