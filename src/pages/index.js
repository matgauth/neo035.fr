import React, { useReducer } from 'react';
import Img from 'gatsby-image';
import BackgroundImage from 'gatsby-background-image';
import { graphql, Link } from 'gatsby';
import useForm from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import ContentLoader from 'react-content-loader';

import PageFooter from '@components/footer';
import SideBar from '@components/sidebar';
import Scroll from '@components/scroll';
import HTML from '@components/inner-html';
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
  const [{ videos, contact }] = useTranslations();
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
      <HTML markdown={videos.description} />
      <div className="row">
        {state.isLoading &&
          config.playlists.map(item => {
            return (
              <div key={item} className="col-4 col-6-wide col-12-mobile">
                <ContentLoader
                  height={400}
                  width={400}
                  speed={2}
                  primaryColor="#fdfdfd"
                  secondaryColor="#f9f9f9"
                >
                  <rect x="0" y="0" width="400" height="400" rx="8" ry="8" />
                </ContentLoader>
              </div>
            );
          })}
        {state.isError && <p className="error">{contact.form.error}</p>}
        {state.data.length > 0 &&
          state.data.map(playlist => (
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
                >
                  Voir la playlist complète{' '}
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
  const [{ events }] = useTranslations();
  return (
    <div className="container">
      <header>
        <h2>{events.title}</h2>
      </header>
      <HTML markdown={events.description} />
      {data.map(({ node: { frontmatter, id, html } }) => {
        return (
          <article key={id} className="item">
            <span className="ribbon">{frontmatter.date}</span>
            <a
              href={frontmatter.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Img
                style={{ maxWidth: 600, margin: `24px auto` }}
                fluid={frontmatter.thumbnail.childImageSharp.fluid}
                alt={frontmatter.title}
              />
            </a>
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        );
      })}
    </div>
  );
};

const Faq = () => {
  const [{ faq }] = useTranslations();
  return (
    <div className="container">
      <header>
        <h2>{faq.title}</h2>
      </header>
      <HTML markdown={faq.description} />
      <Link to="/faq" className="button primary">
        {faq.showMe}
      </Link>
    </div>
  );
};

const getLink = name => `http://${name.split(/[0-9]{2}_/)[1]}`;

const Partners = ({ data }) => {
  const [{ partners }] = useTranslations();
  return (
    <div className="container">
      <header>
        <h2>{partners.title}</h2>
      </header>
      <HTML markdown={partners.description} />
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

const encode = data =>
  Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');

const ContactForm = () => {
  const [{ contact }] = useTranslations();
  const { register, handleSubmit, errors } = useForm();

  const setError = id => err => {
    console.log('Error for DEV: ', err);
    toast.update(id, {
      render: contact.form.error,
      type: toast.TYPE.ERROR,
      autoClose: 5000,
    });
  };

  const setSuccess = id => () =>
    toast.update(id, {
      render: contact.form.success,
      type: toast.TYPE.SUCCESS,
      autoClose: 3000,
    });

  const setLoading = () =>
    toast(contact.form.loading, {
      type: toast.TYPE.WARNING,
      autoClose: false,
    });

  const onSubmit = data => {
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
            placeholder={contact.form.name}
            ref={register({ required: contact.form.required })}
          />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>
        <div className="col-4 col-12-mobile">
          <input
            type="text"
            name="age"
            placeholder={contact.form.age}
            ref={register({
              required: contact.form.required,
              pattern: {
                value: /^[0-9]{2}$/,
                message: contact.form.invalidAge,
              },
            })}
          />
          {errors.age && <span className="error">{errors.age.message}</span>}
        </div>
        <div className="col-4 col-12-mobile">
          <input
            type="text"
            name="email"
            placeholder={contact.form.mail}
            ref={register({
              required: contact.form.required,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: contact.form.invalidMail,
              },
            })}
          />
          {errors.email && (
            <span className="error">{errors.email.message}</span>
          )}
        </div>
        <div className="col-12">
          <textarea
            name="message"
            placeholder={contact.form.message}
            ref={register({ required: contact.form.required })}
          />
          {errors.message && (
            <span className="error">{errors.message.message}</span>
          )}
        </div>
        <div className="col-12">
          <input type="submit" value={contact.form.submit} />
        </div>
      </div>
    </form>
  );
};

const IndexPage = ({
  data: {
    bg,
    events: { edges: eventItems },
    partners: { edges: partnerItems },
  },
}) => {
  const [{ home, events, videos, faq, partners, contact }] = useTranslations();
  const sections = [
    { id: 'top', name: home.nav, icon: 'fa-home' },
    { id: 'events', name: events.nav, icon: 'fa-calendar' },
    { id: 'videos', name: videos.nav, icon: 'fa-youtube-play' },
    { id: 'faq', name: faq.nav, icon: 'fa-question' },
    { id: 'partners', name: partners.nav, icon: 'fa-group' },
    { id: 'contact', name: contact.nav, icon: 'fa-envelope' },
  ];
  return (
    <>
      <SideBar sections={sections} />

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
              <h1 className="alt">{home.title}</h1>
              <HTML markdown={home.description} />
            </header>

            <footer>
              <Scroll type="id" element="events">
                <a href="#events" className="button">
                  {home.showMe}
                </a>
              </Scroll>
            </footer>
          </div>
        </BackgroundImage>
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
            <HTML markdown={contact.description} />
            <ContactForm />
          </div>
        </section>
      </div>

      <PageFooter />
    </>
  );
};

export default IndexPage;

export const query = graphql`
  query Events($locale: String!) {
    bg: file(relativePath: { eq: "bg.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1920, traceSVG: { color: "#222629" }) {
          ...GatsbyImageSharpFluid_tracedSVG
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
              ...GatsbyImageSharpFluid_tracedSVG
            }
          }
        }
      }
    }
    events: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {
        fields: { slug: { regex: "/^(/events/)/" }, locale: { eq: $locale } }
      }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            date(formatString: "DD MMMM YYYY", locale: $locale)
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
  }
`;
