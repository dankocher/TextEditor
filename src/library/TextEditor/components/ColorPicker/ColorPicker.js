import React, {Component} from "react";
import './styles.scss'
import onClickOutside from "react-onclickoutside";
import { CirclePicker } from 'react-color';
import {rgbToHex} from "../../utils/rgbConverter";

const colors = ["#ffffff", "#000000", "#9c27b0", "#673ab7", "#0033a0", "#3f51b5", "#2196f3", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"];

class ColorPicker extends Component{

    state = {
        color: ''
    };

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.color !== this.props.color) {
            let hex = rgbToHex(this.props.color);

            if (hex !== '#000000' || this.state.color !== '') {
                this.setState({color: hex === '#000000' ? '' : hex});
            }
        }

        if (prevProps.open !== this.props.open && this.props.open) {
            //console.log(`div[title=${this.state.color}]`)
            let color = this.state.color || (this.props.type === 'hiliteColor' ? '#ffffff': '#000000');
            let selected = document.querySelector(`div[title="${color}"]`);


            if (selected !== null) {
                //console.log([selected])
                selected.style.boxShadow = `${color === '#ffffff' ? 'gainsboro' : this.state.color} 0px 0px 5px 2px`;
                selected.style.backgroundColor = color;
            }
        }
    }


    handleClickOutside() {
        this.props.onChoose()
    };

    onChoose = (color) => {
        this.props.onChoose(color);
        this.setState({color: color.hex})
    };

    onChange = e => {
      if (e.key === 'Enter') {
          this.props.onChoose({hex: this.state.color})
      }
    };

    render() {
        const {open, type} = this.props;
        const {color} = this.state;

        return !open ? null : <div className={`te-color-picker ${type}`}>
            <div className='cp-arrow'>{}</div>
            <CirclePicker onChangeComplete={this.onChoose} color={color || (this.props.type === 'hiliteColor' ? '#ffffff': '#000000')} colors={colors}/>
            <div className='tecp-input'>
                <input value={color || (this.props.type === 'hiliteColor' ? '#ffffff': '#000000')} onChange={e => this.setState({color: e.target.value})} onKeyPress={this.onChange}/>
            </div>
        </div>
    }
}

export default onClickOutside(ColorPicker);