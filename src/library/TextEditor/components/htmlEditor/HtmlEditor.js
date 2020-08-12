import React, {Component} from "react";
import AceEditor from "react-ace";
import './styles.scss'
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-tomorrow";

export default class HtmlEditor extends Component{

    componentDidMount(){
        let a = document.getElementById('UNIQUE_ID_OF_DIV');
        if(a !== null){
            //a.className+=' ace_focus';
            //console.log([a])
            //let v = a.getElementsByTagName('textarea')[0];
            //v.focus()

        }
    }

    onEditorChange = async (value, event) => {
        let _value = value.replace('>\n\n<', '>\n<div></div>\n<');
        this.props.onChange({target:{value: _value}});
        setTimeout(() => {
            const {row, column, document} = this.refs.ACE_EDITOR.editor.selection.cursor;
            let lines = document.$lines;

            if (lines[row].replace(/^<div><\/div>/gmi, '').trim() === '' && column === 0) {
                this.refs.ACE_EDITOR.editor.gotoLine(row+1, column+5)
            }
        })
    };

    onEditorLoad(editor) {
        editor.session.setUseWorker(false);
        editor.session.setUseWrapMode(true);
    }


    render() {
        const {html, onFocus, onBlur, cursorPosition, selectionHtml, height} = this.props;

        return <div className={'html-editor'}>
                <AceEditor
                    mode="html"
                    theme="tomorrow"
                    value={html}
                    width={'100%'}
                    ref={'ACE_EDITOR'}
                    height={height || '100%'}
                    onFocus={onFocus}
                    //cursorStart={20}
                    onBlur={onBlur}
                    fontSize={16}
                    onChange={this.onEditorChange}
                    onCursorChange={cursorPosition}
                    onSelectionChange={selectionHtml}
                    onLoad={ editor => this.onEditorLoad(editor) }
                    name="UNIQUE_ID_OF_DIV"
                    setOptions={{
                    }}
                    editorProps={{
                        $blockScrolling: Infinity,
                        wrap: true }}
                />
            </div>

    }

}