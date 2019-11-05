import React from 'react';
import PropTypes from 'prop-types';
import showdown from 'showdown';

const HTML = ({ markdown, ...props }) => {
  const converter = new showdown.Converter({
    parseImgDimensions: true,
    openLinksInNewWindow: true,
    emoji: true,
  });
  converter.setFlavor('github');
  return (
    <span
      dangerouslySetInnerHTML={{ __html: converter.makeHtml(markdown) }}
      {...props}
    />
  );
};

HTML.propTypes = {
  markdown: PropTypes.string.isRequired,
};

export default HTML;
