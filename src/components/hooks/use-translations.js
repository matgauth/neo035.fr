import { useContext } from 'react';
import { find, pathEq, path, pipe } from 'ramda';
import { useStaticQuery, graphql } from 'gatsby';

import { LocaleContext } from '../layout';

const findTranslations = locale =>
  pipe(
    find(pathEq(['node', 'name'], locale)),
    path(['node', 'translations'])
  );

const useTranslations = () => {
  const { locale, dateFormat } = useContext(LocaleContext);
  const getFromQuery = findTranslations(locale);
  const { rawData } = useStaticQuery(query);
  return [getFromQuery(rawData.edges), dateFormat];
};

export default useTranslations;

const query = graphql`
  query useTranslations {
    rawData: allFile(filter: { sourceInstanceName: { eq: "translations" } }) {
      edges {
        node {
          name
          translations: childTranslationsJson {
            home {
              nav
              title
              description
              showMe
            }
            events {
              nav
              title
              description
            }
            videos {
              nav
              title
              description
            }
            faq {
              nav
              title
              description
            }
            partners {
              nav
              title
              description
            }
            contact {
              nav
              title
              description
            }
            pageMetadata {
              home {
                title
                description
              }
            }
          }
        }
      }
    }
  }
`;
