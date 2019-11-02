import React from 'react';

import useTranslations from '@hooks/use-translations';
import HTML from '@components/inner-html';
import SideBar from '@components/sidebar';

const IndexPage = () => {
  const { notFound } = useTranslations();
  return (
    <>
      <SideBar />
      <div id="wrapper">
        <div id="main">
          <section>
            <div className="container">
              <section>
                <h1>{notFound.title}</h1>
                <HTML markdown={notFound.description} />
              </section>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default IndexPage;
