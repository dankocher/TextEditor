import React, {Component} from "react";
import PropTypes from 'prop-types';
import './styles.scss'
import Icon from "../Icon";
import SizeSelector from "./SizeSelector";
import t from '../../constants/translations';
import {uploadPicture} from "../../utils/uploadPicture";
import {host} from "../../constants/api";

export default class PictureInput extends Component{

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        onClick: PropTypes.func,
        incorrectPicture: PropTypes.string,
        onePictureMessage: PropTypes.string,
        modalMessage: PropTypes.func
    };

    state = {
      file: null
    };

    onClick = async (e) => {
        this.saveRange();
        e.preventDefault();
        e.stopPropagation();
        this.setSizes(e.target.files)
    };

    range;

    saveRange(){
        this.range = {
            node: window.getSelection().anchorNode,
            position: window.getSelection().extentOffset
        }
    }

    setSizes = async (files, dataTransfer) => {
        //const t = this.props.language.translations;
        const {incorrectPicture, onePictureMessage} = this.props;

        if (files.length === 1) {
            const file = files[0];
            if(file.name.match(/^.*\.(jpg|png)$/gi)) {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = async () => {
                    //this.props.onClick(`<img src='${reader.result}'>`)
                    this.setState({file: reader.result})
                };
            } else {
                this.props.modalMessage({modalVisible: true, modalMessage: incorrectPicture, modalType: 'alert'});
                // alert("File must be SVG, PNG or JPG");
            }
        } else if (files.length > 1) {
            this.props.modalMessage({modalVisible: true, modalMessage: onePictureMessage, modalType: 'alert'});
        }
    };

    editHtml(v){
        const {cursor, onChange} = this.props;
        let lines = JSON.parse(JSON.stringify(cursor.document.$lines));
        let row = cursor.row;
        let el = cursor.column;
        let line = lines[row].split('');
        line.splice(el, 0, `${v}`);
        let _line = line.join('');
        lines[row] = _line;
        onChange(lines.join('\n'))
    }

    setImage = async v => {
        //console.log(this.range)
        let res = await uploadPicture('text_editor_pic', v.img);
        console.log(res)
        if (res.ok) {

            let rng = document.createRange();
            //editor.focus();
            //console.log(this.range)
            let editor = document.getElementsByClassName('text-editor')[0];
            if(this.range.node !== null){
                rng.setStart(this.range.node, this.range.position);
            } else {
                rng.setStart(editor, 0);
            }
            editor = window.getSelection();
            editor.removeAllRanges();
            editor.addRange(rng);

            if(this.props.cursor === undefined){
                this.props.onClick(`<img ${v.float ? 'float="" ' : ''}src='${host.uri}/pic/${res.filename}' style="width: 100%">`);
            } else {
                this.editHtml(`<img ${v.float ? 'float="" ' : ''}src="${host.uri}/pic/${res.filename}">`)
            }

            this.setState({file: null});
            this.input.value = '';
        }
    };

    imgAdd(){
        if(!this.props.html || this.props.cursor){
            this.input.click()
        }
    }

    render() {
        const {width, height, requiredWidth, requiredHeight, saveLabel, cancelLabel, title} = this.props;

        let disabled = !(!this.props.html || this.props.cursor);

        return <>
                <input className='input-picture' type='file' onChange={this.onClick} ref={input => this.input = input}/>
                <div className={`text-editor-button -editor-picture-input${disabled? ' -disabled' : ''}`}
                     style={{width, height}} onClick={() => this.imgAdd()}
                     title={title}
                >
                    <Icon name={'image'} size={18}/>
                </div>
            {
                this.state.file === null ? null :
                    <SizeSelector
                        save={saveLabel || t.save}
                        cancel={cancelLabel || t.cancel}
                        aspect={requiredWidth/requiredHeight}
                        minWidth={1200}
                        file={this.state.file}
                        onChange={v => this.setImage(v)}
                        cancelPic={() => {this.setState({file: null}); this.input.value = ""}}
                    />
            }
            </>

    }
}