import React, { useReducer } from 'react';

import Layout from '@components/layout';
import PageFooter from '@components/footer';
import SideBar from '@components/sidebar';
import Scroll from '@components/scroll';

import pic8 from '../assets/images/pic08.jpg';

import { createVideoNodesFromChannelId } from '../utils';
import config from '../../config';

const apiKey = process.env.GASTBY_YOUTUBE_API_KEY;

const sections = [
  { id: 'top', name: 'Accueil', icon: 'fa-home' },
  { id: 'events', name: 'Evénements', icon: 'fa-calendar' },
  { id: 'videos', name: 'Vidéos', icon: 'fa-youtube-play' },
  { id: 'faq', name: 'FAQ', icon: 'fa-question' },
  { id: 'partners', name: 'Mes partenaires', icon: 'fa-group' },
  { id: 'contact', name: 'Me contacter', icon: 'fa-envelope' },
];

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

  if (state.isLoading) {
    return (
      <div className="folding-cube">
        <div className="cube1 cube"></div>
        <div className="cube2 cube"></div>
        <div className="cube4 cube"></div>
        <div className="cube3 cube"></div>
      </div>
    );
  }
  if (state.isError) {
    return <p>Une erreur est survenue</p>;
  }
  return (
    <section id="videos" className="two">
      <div className="container">
        <header>
          <h2>Vidéos</h2>
        </header>

        <p>
          Life will feel it is always a great need for eu valley, the valley CNN
          ridiculous smile at any time chat mainstream clinical homes. Mauris
          floor was very warm and we need it. One customer now nibh Bureau dark
          pools behavior.
        </p>

        <div className="row">
          {state.data.length > 0 &&
            state.data.map(video => (
              <div key={video.id} className="col-4 col-12-mobile">
                <article className="item">
                  <a href="/#" className="image fit">
                    <img src={video.thumbnail.url} alt="" />
                  </a>
                  <header>
                    <h3>{video.title}</h3>
                  </header>
                </article>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

const IndexPage = () => {
  return (
    <Layout>
      <SideBar sections={sections} />

      <div id="main">
        <section id="top" className="one dark cover">
          <div className="container">
            <header>
              <h2 className="alt">
                Salut! Je suis <strong>Neo035</strong>
                <br />
                Super youtubeurre
              </h2>
              <p>
                Bienvenue à toi, ô noble visiteur, sur mon site web personnel !
              </p>
            </header>

            <footer>
              <Scroll type="id" element={'portfolio'}>
                <a href="#videos" className="button">
                  Show me
                </a>
              </Scroll>
            </footer>
          </div>
        </section>

        <Videos />

        <section id="about" className="three">
          <div className="container">
            <header>
              <h2>About Me</h2>
            </header>

            <a href="/#" className="image featured">
              <img src={pic8} alt="" />
            </a>

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
              <h2>Contact</h2>
            </header>

            <p>
              The element of time, sem ante ullamcorper dolor nulla quam
              placerat viverra environment is not with our customers. Free
              makeup and skirt until the mouse. Japan this innovative and
              ultricies carton salad clinical ridiculous now passes from
              enhanced. Mauris pot innovative care for my pain.
            </p>

            <form method="post" action="#">
              <div className="row">
                <div className="col-6 col-12-mobile">
                  <input type="text" name="name" placeholder="Name" />
                </div>
                <div className="col-6 col-12-mobile">
                  <input type="text" name="email" placeholder="Email" />
                </div>
                <div className="col-12">
                  <textarea name="message" placeholder="Message" />
                </div>
                <div className="col-12">
                  <input type="submit" value="Send Message" />
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>

      <PageFooter />
    </Layout>
  );
};

export default IndexPage;
