import {useEffect} from 'react';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useLanguage} from '~/lib/language';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Fúmount | ${data?.page.title ?? ''}`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  if (params.handle === 'about') {
    return {
      page: {
        handle: 'about',
        id: 'fumount-local-about',
        title: 'About',
        body: '',
        seo: {
          description: 'The Fúmount brand story and contact details.',
          title: 'About Fúmount',
        },
      },
    };
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  if (page.handle === 'about') {
    return <AboutPage />;
  }

  return (
    <div className="page">
      <header>
        <h1>{page.title}</h1>
      </header>
      <main dangerouslySetInnerHTML={{__html: page.body}} />
    </div>
  );
}

function AboutPage() {
  const {language, t} = useLanguage();

  useEffect(() => {
    document.title =
      language === 'zh' ? 'Fúmount | 关于我们' : 'Fúmount | About';
  }, [language]);

  return (
    <main className="about-page-main">
      <div className="about-hero-wrap">
        <figure className="about-hero-figure">
          <img
            src="/fumount-design/images/hi.png"
            alt=""
            width="1200"
            height="2400"
            decoding="async"
          />
        </figure>
      </div>

      <section
        className="about-copy"
        id="about-copy"
        lang={language === 'zh' ? 'zh-CN' : 'en'}
        aria-labelledby="about-heading"
      >
        <div className="about-copy__inner">
          <h1 id="about-heading" className="about-copy__title">
            {t.aboutTitle}
          </h1>
          <div className="about-copy__body">
            {t.aboutParas.map((paragraph) => (
              <p className="about-copy__para" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section
        className="about-contact"
        id="contact-us"
        lang={language === 'zh' ? 'zh-CN' : 'en'}
        aria-labelledby="contact-us-heading"
      >
        <div className="about-contact__inner">
          <h2 id="contact-us-heading" className="about-contact__title">
            {t.contactHeading}
          </h2>
          <p className="about-contact__placeholder">
            {t.contactPlaceholder}
          </p>
        </div>
      </section>
    </main>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
