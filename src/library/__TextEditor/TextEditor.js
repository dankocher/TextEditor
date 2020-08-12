import React from 'react';
import PropTypes from 'prop-types';
import {normalizeHtml, htmlToText} from './utils';

import './styles.scss';

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
    };

    state = {
        html: '',
        text: '',
        normalizedHtml: '',
        htmlEditor: 'show', //hide|show|only
        textFocused: false
    };

    componentDidMount() {
        this.lastHtml = this.props.html;
        this.setState({html: this.lastHtml, text: this.lastHtml});
    }

    onKeyDown = (e) => {
        // console.log(e)
    };

    onSelectText = (e) => {
        console.log(e.target.selected)
    };

    emitChange = originalEvt => {
        const el = this.el;
        if (!el) return;
        let text = el.innerHTML;
        const normalizedHtml = normalizeHtml(text);
        const html = text;
        if (this.props.onChange && html !== this.lastHtml) {
            // Clone event with Object.assign to avoid
            // "Cannot assign to read only property 'target' of object"
            const evt = Object.assign({}, originalEvt, { target: { value: html }});
            this.props.onChange(evt);
        }
        this.lastHtml = html;

        this.setState({html, normalizedHtml});
    };

    onChangeHtml = e => {
        let normalizedHtml = e.target.value;
        this.setState({normalizedHtml, html: htmlToText(normalizedHtml)})
    };

    onFocusText = () => {
        this.setState({text: this.state.html, textFocused: true});
        // this.emitChange();
    };

    onBlurText = () => {
        this.setState({textFocused: false});
        // this.emitChange();
    };

    render() {

        const {width, height} = this.props;

        const {htmlEditor, text, textFocused, html, normalizedHtml} = this.state;

        return (
            <div className={`TextEditor html-${htmlEditor}`} style={{width, height}}>
                <div className="-tools">

                </div>
                <div className="text-editor"
                     ref={el => this.el = el}
                     contentEditable={!this.props.disabled}
                     onInput={this.emitChange}
                     onFocus={this.onFocusText}
                     onBlur={this.onBlurText}
                     onKeyUp={this.props.onKeyUp || this.emitChange}
                     onKeyDown={this.props.onKeyDown || this.emitChange}
                     dangerouslySetInnerHTML={{__html: textFocused ? text : html}}
                />
                <textarea
                    className={'html-editor'}
                    value={textFocused ? normalizeHtml(html) : normalizedHtml}
                    onChange={this.onChangeHtml}
                />
            </div>
        )
    }
}

export default TextEditor;

