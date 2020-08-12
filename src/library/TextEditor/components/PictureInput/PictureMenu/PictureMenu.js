import React, {Component} from "react";
import Icon from "../../Icon";
import './styles.scss'

export default class PictureMenu extends Component{
    clicked = 0;

    componentDidMount() {
        let el = document.getElementsByClassName('text-editor')[0];
        el.addEventListener('scroll', this.removeOnScroll);
        window.addEventListener('click', this.removeOnClick)
    }

    componentWillUnmount() {
        let el = document.getElementsByClassName('text-editor')[0];
        el.removeEventListener('scroll', this.removeOnScroll);
        window.removeEventListener('click', this.removeOnClick)
    }

    removeOnScroll = () => {
        this.props.setHtml(this.props.html)
    };

    removeOnClick = (e) => {
        if(this.clicked > 0 && !e.path.some(o => o.className === 'text-editor') && e.target.tagName !== 'IMG'){
            this.props.setHtml(this.props.html)
        }
        this.clicked += 1;
    };

    changeStyle(value){
        const {menu, html, setHtml} = this.props;
        let img = menu.target.outerHTML;
        let parent = menu.target.parentElement.outerHTML === `<div style="display: flex; align-items: center; justify-content: center">${img}</div>`;
        let float =  value === 'center' ? 'none' : value;
        let margin = value === 'center' ? '0 10px' : value === 'right' ? '0 0 0 10px' : '0 10px 0 0';

        let newTarget = img;
        let newHtml = html.replace((!parent ? img : `<div style="display: flex; align-items: center; justify-content: center">${img}</div>`), v => {
            newTarget = (value !== 'center' ? img : `<div style="display: flex; align-items: center; justify-content: center">${img}</div>`).
            replace(/style=".*?"/gmi, s => s.replace(/float:.*?;\s*?margin:.*/gmi, `float: ${float}; margin: ${margin}"`));
            return newTarget
        });

        setHtml(newHtml)
    }

    render(){
        const {menu} = this.props;
        let float = menu.target.style.float;

        return <div className={'picture-menu'} style={{position: 'absolute', left: menu.x, top: menu.y}}>
            <div float={`${float === 'left'}`} onClick={() => this.changeStyle('left')}><Icon name={'paragraph-left'} size={20}/></div>
            <div float={`${float === 'none'}`} onClick={() => this.changeStyle('center')}><Icon name={'paragraph-center'} size={20}/></div>
            <div float={`${float === 'right'}`} onClick={() => this.changeStyle('right')}><Icon name={'paragraph-right'} size={20}/></div>
        </div>
    }
}