import React, {Component} from 'react';
import './styles.scss';
import PropTypes from "prop-types";
import t from '../constants/translations'

export default class Modal extends Component {

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        message: PropTypes.string.isRequired,
        type: PropTypes.string,
        cancelText: PropTypes.string,
        acceptText: PropTypes.string,
        onCancel: PropTypes.func,
        onConfirm: PropTypes.func,
        isWarning: PropTypes.bool
    };

    state = {
        show: false,
        value: undefined
    };


    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.visible !== this.props.visible && this.props.visible){
            setTimeout(() => {
                this.setState({show: this.props.visible})
            }, 10);
        }

        if(this.props.type === 'input' && this.props.link !== this.state.value && this.state.value === undefined){
           this.setState({value: this.props.link})
        }
    }

    onCancel = () => {
        this.setState({show: false, value: undefined});
        setTimeout(() => {
            if (this.props.onCancel !== undefined) {
                this.props.onCancel();
            }
        }, 350)
    };

    onConfirm = () => {

        this.setState({show: false});
        setTimeout(() => {
            if (this.props.onConfirm !== undefined) {
                this.props.onConfirm(this.state.value);
                this.setState({value: undefined})
            }
        }, 400)
    };

    render() {
        const {visible, message, isWarning, type, title} = this.props;
        const {value} = this.state;

        const cancelText = this.props.cancelText || (type === 'alert' ? 'OK' : t.no);
        const acceptText = this.props.acceptText || t.yes;

        if (!visible) return null;
        //console.log(this.props)
        return <div className={`modal${this.state.show ? " -show": ""}`}>
            <div className="overflow" onClick={this.onCancel}/>
            <div className="m-confirm">
                <div className='modal-title'>
                    {title || ""}
                </div>
                <hr/>
                <div className="message">
                    {
                        type !== 'input' ?
                        message :
                            <input value={value || ''} onChange={e => this.setState({value: e.target.value})} ref={input => this.input = input}/>
                    }
                </div>
                <hr/>
                <div className="buttons">
                    <div className="m-button -cancel" onClick={this.onCancel}>{cancelText}</div>
                    {   type === 'alert' ? null :
                        <div className={`m-button ${isWarning ? "-warning" : "-accept"}`} onClick={this.onConfirm}>{acceptText}</div>
                    }
                </div>
            </div>
        </div>
    }
}