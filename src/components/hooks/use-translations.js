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
  const locale = useContext(LocaleContext);
  const getFromQuery = findTranslations(locale);
  const { rawData } = useStaticQuery(query);
  return getFromQuery(rawData.edges);
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
              watchPlaylist
            }
            faq {
              nav
              title
              description
              showMe
              publishedAt
              watchVideo
              searchPlaceholder
              questions
              time
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
              form {
                error
                success
                loading
                name
                age
                mail
                message
                required
                invalidAge
                invalidMail
                submit
              }
            }
            notFound {
              title
              description
            }
            footer {
              legalNotices
              copyright
            }
            pageMetadata {
              home {
                title
                description
              }
              faq {
                title
                description
              }
              legalNotices {
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
