import React from 'react';

import useTranslations from '@hooks/use-translations';
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
                <p>{notFound.descrription}</p>
              </section>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default IndexPage;
