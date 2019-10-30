import React, { useReducer } from 'react';
import Img from 'gatsby-image';
import BackgroundImage from 'gatsby-background-image';
import { graphql } from 'gatsby';
import useForm from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';

import Modal from '@components/modal';
import PageFooter from '@components/footer';
import SideBar from '@components/sidebar';
import Scroll from '@components/scroll';
import HTML from '@components/inner-html';
import useTranslations from '@hooks/use-translations';

import { createVideoNodesFromChannelId } from '@utils';
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
        const result = await createVideoNodesFromChannelId(
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

  if (state.isError) {
    return <p>{contact.form.error}</p>;
  }
  return (
    <>
      <Modal isOpen={state.isLoading}>
        <div className="folding-cube">
          <div className="cube1 cube"></div>
          <div className="cube2 cube"></div>
          <div className="cube4 cube"></div>
          <div className="cube3 cube"></div>
        </div>
      </Modal>
      <div className="container">
        <header>
          <h2>{videos.title}</h2>
        </header>
        <HTML markdown={videos.description} />
        <div className="row">
          {state.data.length > 0 &&
            state.data.map(video => (
              <div key={video.id} className="col-4 col-12-mobile">
                <article className="item">
                  <a
                    href={`https://youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image fit"
                  >
                    <img src={video.thumbnail} alt={video.title} />
                  </a>
                </article>
              </div>
            ))}
        </div>
      </div>
    </>
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

const Faq = ({ data }) => {
  const [{ faq }] = useTranslations();
  return (
    <div className="container">
      <header>
        <h2>{faq.title}</h2>
      </header>
      <HTML markdown={faq.description} />
      {data.map(({ node: { frontmatter, id, html } }) => {
        return (
          <article key={id}>
            <div className="row">
              <div className="col-3 col-12-mobile">
                <div className="item">
                  <a
                    href={frontmatter.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Img
                      fluid={frontmatter.thumbnail.childImageSharp.fluid}
                      alt={frontmatter.title}
                    />
                  </a>
                </div>
              </div>
              <div
                className="col-9 col-12-mobile"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </article>
        );
      })}
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
  const { register, handleSubmit, errors } = useForm();
  const [{ contact }] = useTranslations();

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
    faq: { edges: faqItems },
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
              <h2 className="alt">{home.title}</h2>
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
        <section id="events" className="two">
          <Events data={eventItems} />
        </section>
        <section id="videos" className="three">
          <Videos />
        </section>
        <section id="faq" className="four">
          <Faq data={faqItems} />
        </section>
        <section id="partners" className="three">
          <Partners data={partnerItems} />
        </section>
        <section id="contact" className="four">
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
            fluid(maxWidth: 400, traceSVG: { color: "#222629" }) {
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
    faq: allMarkdownRemark(
      filter: {
        fields: { slug: { regex: "/^(/faq/)/" }, locale: { eq: $locale } }
      }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            thumbnail {
              childImageSharp {
                fluid(maxWidth: 480, traceSVG: { color: "#222629" }) {
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
