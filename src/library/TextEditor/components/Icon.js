import React from 'react';
import PropTypes from 'prop-types';
import IcomoonReact from 'icomoon-react';
import iconSet from '../assets/selection.json';

const Icon = (props) => {
    const { color, size, name } = props;
    return <IcomoonReact iconSet={iconSet} color={color} size={size} icon={name} />;
};

Icon.propTypes = {
    color: PropTypes.string,
    name: PropTypes.string.isRequired,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Icon.defaultProps = {
    color: 'black',
    size: '100%',
};

export default Icon;