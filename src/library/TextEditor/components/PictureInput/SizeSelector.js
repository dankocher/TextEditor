import React, {Component} from "react";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/lib/ReactCrop.scss';
import Button from "../Button/Button";
import Icon from "../Icon";

const Width = 1000, Height=600;

export default class SizeSelector extends Component {

    state = {
        cropped: null,
        croppedImageUrl: null,
        show: false,
        height: 1,
        width: 1,
        float: false,
        crop: {
            unit: 'px', // default, can be 'px' or '%'
            x: 50,
            y: 50,
            // width: 200,
            // height: 200
        }
    };

    componentDidMount() {

        const {aspect, minWidth, minHeight} = this.props;

        this.setState({
            crop: {
                ...this.state.crop,
                unit: 'px', // default, can be 'px' or '%'
                x: 50,
                y: 50,
                width: minWidth || 480,
                height: minHeight || 320,
                aspect: aspect.toString() !== 'NaN' ? aspect : undefined
            }
        })
    }

    onImageLoaded = image => {
        this.imageRef = image;
    };

    onCropComplete = crop => {
        this.makeClientCrop(crop);
    };

    async makeClientCrop(crop) {

        if (this.imageRef && crop.width && crop.height) {

            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                crop,
                'newFile.jpeg'
            );

            this.setState({ croppedImageUrl });
        }
    }

    getCroppedImg(image, crop, fileName) {
        let type = this.props.file.split('base64')[0].split('/')[1].split(';')[0];

        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');

        canvas.width = crop.width;
        canvas.height = crop.height;

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {

            canvas.toBlob(blob => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }

                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
            }, `image/${type}`);

        });
    }

    onCropChange = (crop, percentCrop) => {
        // You could also use percentCrop:
        // this.setState({ crop: percentCrop });
        const {width, height} = crop;

        if (width !== 0 && height !== 0) {
            this.setState({crop});
        }
    };

    savePic(){
        //this.setState({file: this.state.croppedImageUrl, cropped: null});
        this.props.onChange({img: this.state.croppedImageUrl, float: this.state.float})
    }

    cancelPic(){
        this.props.cancelPic()
    }

    makeSize(){
        const {crop} = this.state;
        const {minWidth, minHeight} = this.props;

        let pic = this.img;
        let a = pic.naturalWidth/pic.naturalHeight;
        let b = Width/Height;

        let floatWidth = minWidth || 480;
        let floatHeight = minHeight || 320;

        let y = a > b ? ((Width*pic.naturalHeight / pic.naturalWidth) -floatHeight)/2 : (Height - floatHeight > 0 ? (Height - floatHeight)/2 : 0) ;
        let x = a < b ? ((Height*pic.naturalWidth / pic.naturalHeight) -floatWidth)/2 : (Width - floatWidth > 0 ? (Width - floatWidth)/2 : 0);


        this.setState({width: pic.naturalWidth, height: pic.naturalHeight, show: true, crop: {...crop, y: y, x: x}})
    };

    makeBorder(crop, float){
        const {width, height} = this.state;
        const {minWidth, minHeight} = this.props;

        let a = width/height, b = Width/Height,
            floatWidth = minWidth || 480, floatHeight = minHeight || 320,
            sizeHeight = a>b ? (Width * height)/width : Height, sizeWidth = a>b ? Width : (Height*width)/height;

        let y = float ? (a > b ? ((Width*height / width) -floatHeight)/2 : (Height - floatHeight > 0 ? (Height - floatHeight)/2 : 0)) :
            (sizeHeight>320 ? (sizeHeight-320)/2 : 0);
        let x = float ? (a < b ? ((Height*width / height) -floatWidth)/2 : (Width - floatWidth > 0 ? (Width - floatWidth)/2 : 0)) :
            (sizeWidth>480 ? (sizeWidth-480)/2 : 0);

        return {
            ...crop,
            width: !float ? 480 : floatWidth,
            height: !float ? 320 : floatHeight,
            x,
            y
        }
    }


    render() {
        const {save, file, cancel, minWidth, minHeight} = this.props;
        const {crop, show, height, width, float} = this.state;

        let a = width/height;
        let b = Width/Height;

        return <div className='picture-size-selector'>
            <div className='resize-area'>
                <img src={file} alt={''} style={{position: 'absolute', top: -1000000, minWidth: minWidth, minHeight: minHeight}} onLoad={() => this.makeSize()} ref={img => this.img = img}/>
                <div className={`pss-items${a>b ? ' -width' : ' -height'}`}>
                    {
                        !show ? null :
                            <ReactCrop src={file}
                                       crop={crop}
                                       style={{maxWidth: Width, maxHeight: Height}}
                                       ruleOfThirds
                                       onImageLoaded={this.onImageLoaded}
                                       onComplete={this.onCropComplete}
                                       onChange={this.onCropChange}
                                       minWidth={float ? undefined : minWidth}
                            />
                    }
                </div>
                <div className='pss-items -buttons'>
                    <div className={`size-change${float ? ' -float' : ''}`}
                         onClick={() => this.setState({
                             float: !float,
                             crop: this.makeBorder(crop, float)
                         })}
                    >
                        <Icon name={"move-horizontal"} size={26}/>
                    </div>
                    <div className='size'>
                        {Math.round(crop.width)+'x'+Math.round(crop.height)}
                    </div>
                    <Button title={save || ''} onClick={() => this.savePic()} type={'save'}/>
                    <Button title={cancel || ''} onClick={() => this.cancelPic()} type={'cancel'}/>
                </div>
            </div>
        </div>
    }
}