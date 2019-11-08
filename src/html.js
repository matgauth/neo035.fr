import React from 'react';
import PropTypes from 'prop-types';

import { manifestName, manifestThemeColor } from '../config.json';

const HTML = ({
  htmlAttributes,
  headComponents,
  bodyAttributes,
  body,
  preBodyComponents,
  postBodyComponents,
}) => (
  <html {...htmlAttributes}>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="application-name" content={manifestName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content={manifestThemeColor}
      />
      <meta name="apple-mobile-web-app-title" content={manifestName} />
      <link rel="shortcut icon" href="/img/favicon.png" />
      {headComponents}
    </head>
    <body {...bodyAttributes}>
      {preBodyComponents}
      <div
        key="body"
        id="___gatsby"
        dangerouslySetInnerHTML={{ __html: body }}
      />
      {postBodyComponents}
    </body>
  </html>
);

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
};

export default HTML;
