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
import useTranslations from '@hooks/use-translations';

import { createVideoNodesFromChannelId } from '@utils';
import config from '@config';

const apiKey = process.env.GASTBY_YOUTUBE_API_KEY;

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
  const [{ videos }] = useTranslations();
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
    return <p>Une erreur est survenue</p>;
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
        <p>{videos.description}</p>
        <div className="row">
          {state.data.length > 0 &&
            state.data.map(video => (
              <div key={video.id} className="col-4 col-12-mobile">
                <article className="item">
                  <a href="/#" className="image fit">
                    <img src={video.thumbnail} alt="" />
                  </a>
                  <header>
                    <h3>{video.title}</h3>
                  </header>
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
      {data.map(({ node: { frontmatter, id, html } }) => {
        return (
          <article key={id} className="item">
            <div className="row">
              <div className="col-3 col-12-mobile">
                <Img
                  fluid={frontmatter.thumbnail.childImageSharp.fluid}
                  alt={frontmatter.title}
                />
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

const encode = data =>
  Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');

const ContactForm = () => {
  const { register, handleSubmit, errors } = useForm();

  const setError = id => err => {
    toast.update(id, {
      render: `Hmmm... Le code n'est pas bon ! C'est sur l'invitation ;-)`,
      type: toast.TYPE.ERROR,
      autoClose: 5000,
    });
  };

  const setSuccess = id => () =>
    toast.update(id, {
      render: `Bravo ! C'était le bon code. Bonne visite !`,
      type: toast.TYPE.SUCCESS,
      autoClose: 3000,
    });

  const setLoading = () =>
    toast(`Avec de la patience, on vient à bout de tout...`, {
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
            placeholder="Name"
            ref={register({
              required: 'Required',
            })}
          />
          {errors.name && errors.name.message}
        </div>
        <div className="col-4 col-12-mobile">
          <input
            type="text"
            name="age"
            placeholder="Age"
            ref={register({
              required: 'Required',
              pattern: {
                value: /^[0-9]{2}$/,
                message: 'invalid age',
              },
            })}
          />
          {errors.age && errors.age.message}
        </div>
        <div className="col-4 col-12-mobile">
          <input
            type="text"
            name="email"
            placeholder="Email"
            ref={register({
              required: 'Required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'invalid email address',
              },
            })}
          />
          {errors.email && errors.email.message}
        </div>
        <div className="col-12">
          <textarea name="message" placeholder="Message" />
        </div>
        <div className="col-12">
          <input type="submit" value="Send Message" />
        </div>
      </div>
    </form>
  );
};

const IndexPage = ({
  data: {
    bg,
    allMarkdownRemark: { edges },
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
              <p>{home.subtitle}</p>
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
          <Events data={edges} />
        </section>
        <section id="videos" className="three">
          <Videos />
        </section>
        <section id="faq" className="four">
          <div className="container">
            <header>
              <h2>{faq.title}</h2>
            </header>
            <p>
              Developers football competition in diameter big price to layer the
              pot. Chavez ultricies care who wants to CNN. Lobortis elementum
              aliquet eget a den of which they do not hold it in hatred
              developers nor the mountains of the deposit slip. The element of
              time, sem ante ullamcorper dolor nulla quam placerat viverra
              environment is not with our customers. Free makeup and skirt until
              the mouse or partners or to decorate each targeted.
            </p>
          </div>
        </section>
        <section id="partners" className="three">
          <div className="container">
            <header>
              <h2>{partners.title}</h2>
            </header>
            <p>
              Developers football competition in diameter big price to layer the
              pot. Chavez ultricies care who wants to CNN. Lobortis elementum
              aliquet eget a den of which they do not hold it in hatred
              developers nor the mountains of the deposit slip. The element of
              time, sem ante ullamcorper dolor nulla quam placerat viverra
              environment is not with our customers. Free makeup and skirt until
              the mouse or partners or to decorate each targeted.
            </p>
          </div>
        </section>
        <section id="contact" className="four">
          <div className="container">
            <header>
              <h2>{contact.title}</h2>
            </header>

            <p>
              The element of time, sem ante ullamcorper dolor nulla quam
              placerat viverra environment is not with our customers. Free
              makeup and skirt until the mouse. Japan this innovative and
              ultricies carton salad clinical ridiculous now passes from
              enhanced. Mauris pot innovative care for my pain.
            </p>

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
        fluid(maxWidth: 1920) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
    allMarkdownRemark(
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
            thumbnail {
              childImageSharp {
                fluid(maxWidth: 400, traceSVG: { color: "#1a214d" }) {
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
