import React, { useReducer } from 'react';
import Img from 'gatsby-image';
import BackgroundImage from 'gatsby-background-image';
import { graphql } from 'gatsby';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import Scrollspy from 'react-scrollspy';
import ContentLoader from 'react-content-loader';
import isFuture from 'date-fns/isFuture';

import Scroll from '@components/scroll';
import SideBar from '@components/sidebar';
import LocalizedLink from '@components/localized-link';
import useTranslations from '@hooks/use-translations';

import { getPlaylistsFromChannelId } from '@utils';
import config from '@config';

const apiKey = process.env.GATSBY_YT_APIKEY;

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Videos = () => {
  const { videos, contact, errata } = useTranslations();
  const [state, dispatch] = useReducer(reducer, {
    isLoading: false,
    isError: false,
    data: [],
  });
  React.useEffect(() => {
    let didCancel = false;
    const fetchVideos = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await getPlaylistsFromChannelId(
          config.channelId,
          apiKey
        );
        if (!didCancel) dispatch({ type: 'FETCH_SUCCESS', payload: result });
      } catch (e) {
        if (!didCancel) dispatch({ type: 'FETCH_FAILURE' });
      }
    };
    fetchVideos();
    return () => {
      didCancel = true;
    };
  }, []);

  return (
    <div className="container">
      <header>
        <h2>{videos.title}</h2>
      </header>
      <p>{videos.description}</p>
      <LocalizedLink
        to="/errata"
        className="button primary"
        aria-label={errata.description}
      >
        <span className="icon fa-exclamation" /> {errata.showMe}
      </LocalizedLink>
      {state.isError && <p className="error">{contact.form.error}</p>}
      <div className="row">
        {state.isLoading &&
          config.playlists.map((item) => {
            return (
              <div key={item} className="col-4 col-6-wide col-12-mobile">
                <ContentLoader
                  height={400}
                  width={400}
                  speed={2}
                  foregroundColor="#fdfdfd"
                  backgroundColor="#f9f9f9"
                >
                  <rect x="0" y="0" width="400" height="400" rx="8" ry="8" />
                </ContentLoader>
              </div>
            );
          })}
        {state.data.length > 0 &&
          state.data.map((playlist) => (
            <div key={playlist.id} className="col-4 col-6-wide col-12-mobile">
              <article className="item">
                <span className="ribbon">
                  {playlist.videoCount}{' '}
                  <span className="icon fa-video-camera" />
                </span>
                <a
                  href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={playlist.title}
                >
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="image fit"
                  />
                </a>
                <h3>{playlist.title}</h3>
                <a
                  href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${videos.watchPlaylist} ${playlist.title}`}
                >
                  {videos.watchPlaylist}{' '}
                  <span className="icon fa-arrow-right" />
                </a>
              </article>
            </div>
          ))}
      </div>
    </div>
  );
};

const Events = ({ data }) => {
  const { events } = useTranslations();
  const futureEvents = data.filter(({ node }) =>
    isFuture(new Date(node.frontmatter.date))
  );
  return (
    <div className="container">
      <header>
        <h2>{events.title}</h2>
      </header>
      <p>{events.description}</p>
      {!!futureEvents.length ? (
        futureEvents.map(({ node: { frontmatter, id, html } }) => {
          return (
            <article key={id} className="item">
              <span className="ribbon">{frontmatter.formattedDate}</span>
              <div className="inner-item">
                {frontmatter.thumbnail && (
                  <a
                    href={frontmatter.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={frontmatter.title}
                  >
                    <Img
                      style={{
                        maxWidth: 500,
                        margin: `0 auto 1.5em auto`,
                      }}
                      fluid={frontmatter.thumbnail.childImageSharp.fluid}
                      alt={frontmatter.title}
                    />
                  </a>
                )}
                <h3>{frontmatter.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </article>
          );
        })
      ) : (
        <article className="item">
          <div className="inner-item">
            <h3>{events.noEventScheduled}</h3>
          </div>
        </article>
      )}
    </div>
  );
};

const Faq = () => {
  const { faq } = useTranslations();
  return (
    <div className="container">
      <header>
        <h2>{faq.title}</h2>
      </header>
      <p>{faq.description}</p>
      <LocalizedLink
        to="/faq"
        className="button primary"
        aria-label={faq.description}
      >
        {faq.showMe}
      </LocalizedLink>
    </div>
  );
};

const getLink = (name) => `http://${name.split(/[0-9]{2}_/)[1]}`;

const Partners = ({ data }) => {
  const { partners } = useTranslations();
  return (
    <div className="container">
      <header>
        <h2>{partners.title}</h2>
      </header>
      <p>{partners.description}</p>
      <div className="row">
        {data.map(({ node: { childImageSharp, id, name } }) => (
          <div key={id} className="col-3 col-12-mobile">
            <article className="item">
              <a href={getLink(name)} target="_blank" rel="noopener noreferrer">
                <Img fluid={childImageSharp.fluid} alt={name} />
              </a>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
};

const encode = (data) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');

const ContactForm = () => {
  const { contact } = useTranslations();
  const { register, handleSubmit, errors, reset } = useForm();

  const setError = (id) => (err) => {
    toast.update(id, {
      render: contact.form.error,
      type: toast.TYPE.ERROR,
      autoClose: 5000,
    });
  };

  const setSuccess = (id) => () => {
    toast.update(id, {
      render: contact.form.success,
      type: toast.TYPE.SUCCESS,
      autoClose: 3000,
    });
    reset();
  };
  const setLoading = () =>
    toast(contact.form.loading, {
      type: toast.TYPE.WARNING,
      autoClose: false,
    });

  const onSubmit = (data) => {
    let toastId = setLoading();
    axios
      .post('/', encode({ 'form-name': 'contact', ...data }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then(setSuccess(toastId))
      .catch(setError(toastId));
  };
  return (
    <form
      name="contact"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input type="hidden" name="form-name" value="contact" />
      <div hidden>
        <label>
          Don’t fill this out: <input name="bot-field" />
        </label>
      </div>
      <div className="row">
        <div className="col-4 col-12-mobile">
          <input
            type="text"
            name="name"
            aria-label={contact.form.name}
            placeholder={contact.form.name}
            {...(errors.name ? { className: 'error' } : {})}
            ref={register({ required: true })}
          />
        </div>
        <div className="col-4 col-12-mobile">
          <input
            type="text"
            name="age"
            aria-label={contact.form.age}
            placeholder={contact.form.age}
            {...(errors.age ? { className: 'error' } : {})}
            ref={register({
              required: true,
              pattern: {
                value: /^[0-9]{2}$/,
              },
            })}
          />
          {errors.age && <span className="error">{errors.age.message}</span>}
        </div>
        <div className="col-4 col-12-mobile">
          <input
            type="text"
            name="email"
            aria-label={contact.form.mail}
            placeholder={contact.form.mail}
            {...(errors.email ? { className: 'error' } : {})}
            ref={register({
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              },
            })}
          />
        </div>
        <div className="col-12">
          <textarea
            name="message"
            aria-label={contact.form.message}
            placeholder={contact.form.message}
            {...(errors.message ? { className: 'error' } : {})}
            ref={register({ required: true })}
          />
        </div>
        <div className="col-12">
          <input type="submit" value={contact.form.submit} />
        </div>
      </div>
    </form>
  );
};

const Nav = ({ sections = [] }) => {
  return (
    <nav id="nav">
      <ul>
        <Scrollspy
          items={sections.map((s) => s.id)}
          currentClassName="active"
          offset={-300}
        >
          {sections.map((s) => {
            return (
              <li key={s.id}>
                <Scroll type="id" element={s.id}>
                  <a href={`#${s.id}`} title={s.name}>
                    <span className={`icon ${s.icon}`}>{s.name}</span>
                  </a>
                </Scroll>
              </li>
            );
          })}
        </Scrollspy>
      </ul>
    </nav>
  );
};

const IndexPage = ({
  data: {
    bg,
    events: { edges: eventItems },
    partners: { edges: partnerItems },
    home: homeMd,
    about: aboutMd,
  },
}) => {
  const {
    home,
    about,
    events,
    videos,
    faq,
    partners,
    contact,
  } = useTranslations();
  const sections = [
    { id: 'top', name: home.nav, icon: 'fa-home' },
    { id: 'about', name: about.nav, icon: 'fa-user' },
    { id: 'events', name: events.nav, icon: 'fa-calendar' },
    { id: 'videos', name: videos.nav, icon: 'fa-youtube-play' },
    { id: 'faq', name: faq.nav, icon: 'fa-question' },
    { id: 'partners', name: partners.nav, icon: 'fa-group' },
    { id: 'contact', name: contact.nav, icon: 'fa-envelope' },
  ];
  return (
    <>
      <SideBar>
        <Nav sections={sections} />
      </SideBar>
      <div id="main">
        <BackgroundImage
          Tag="section"
          id="top"
          title="background"
          className="dark cover"
          role="img"
          aria-label="background"
          fluid={bg.childImageSharp.fluid}
        >
          <div className="container">
            <header>
              <h1 className="alt">{homeMd.frontmatter.title}</h1>
            </header>
            <article dangerouslySetInnerHTML={{ __html: homeMd.html }} />

            <footer>
              <Scroll type="id" element="about">
                <a href="#about" className="button">
                  {home.showMe}
                </a>
              </Scroll>
            </footer>
          </div>
        </BackgroundImage>
        <section id="about" className="alt-2">
          <div className="container">
            <header>
              <h2>{aboutMd.frontmatter.title}</h2>
            </header>
            <article dangerouslySetInnerHTML={{ __html: aboutMd.html }} />
          </div>
        </section>
        <section id="events" className="alt-1">
          <Events data={eventItems} />
        </section>
        <section id="videos" className="alt-2">
          <Videos />
        </section>
        <section id="faq" className="alt-1">
          <Faq />
        </section>
        <section id="partners" className="alt-2">
          <Partners data={partnerItems} />
        </section>
        <section id="contact" className="alt-1">
          <div className="container">
            <header>
              <h2>{contact.title}</h2>
            </header>
            <p>{contact.description}</p>
            <ContactForm />
          </div>
        </section>
      </div>
    </>
  );
};

export default IndexPage;

export const query = graphql`
  query Index($locale: String!) {
    bg: file(relativePath: { eq: "bg.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1920) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    partners: allFile(
      filter: {name: {regex: "/^[0-9]{2}_www.[^ \"]+$/"}}
      sort: { fields: name }
    ) {
      edges {
        node {
          id
          name
          ext
          childImageSharp {
            fluid(maxWidth: 500, traceSVG: { color: "#222629" }) {
              src
            }
          }
        }
      }
    }
    events: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: ASC }
      filter: {
        fields: { locale: { eq: $locale } }, 
        frontmatter: { key: {eq: "event" } }
      }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            date
            formattedDate: date(formatString: "DD MMMM YYYY", locale: $locale)
            thumbnail {
              childImageSharp {
                fluid(maxWidth: 600, traceSVG: { color: "#222629" }) {
                  ...GatsbyImageSharpFluid_tracedSVG
                }
              }
            }
            title
            link
          }
        }
      }
    }
    home: markdownRemark(fields: {locale: {eq: $locale}}, frontmatter: {key: {eq: "home"}}) {
      html
      frontmatter {
        title
      }
    }
    about: markdownRemark(fields: {locale: {eq: $locale}}, frontmatter: {key: {eq: "about"}}) {
      html
      frontmatter {
        title
      }
    }
  }
`;
