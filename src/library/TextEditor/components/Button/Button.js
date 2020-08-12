import React, {Component} from 'react';
import "./styles.scss";
import PropTypes from "prop-types";

class Button extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        type: PropTypes.string,
        disabled: PropTypes.bool,
        style: PropTypes.object,
        onClick: PropTypes.func.isRequired
    };

    render() {
        const {title, type, disabled, style, onClick} = this.props;

        return <div className={`button ${type !== undefined ? "-"+type : ""}${disabled ? " -disabled" : ""}`}
                    style={style}
                    onClick={onClick}
        >{title}</div>
    }
}

export default Button;