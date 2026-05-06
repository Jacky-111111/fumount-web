import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

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

      <section className="about-copy" id="about-copy" aria-labelledby="about-heading">
        <div className="about-copy__inner">
          <h1 id="about-heading" className="about-copy__title">
            Who we are
          </h1>
          <div className="about-copy__body">
            <p className="about-copy__para">
              Fúmount uses incense, a tangible medium, to shape an intimate,
              invisible field for you in every breath.
            </p>
            <p className="about-copy__para">
              This is not about taking from the world; it is a pilgrimage that
              turns inward.
            </p>
            <p className="about-copy__para">
              Along the way, fragrance clears distraction and steadies the mind,
              until you can hear your true inner voice and glimpse the wisdom
              already within you.
            </p>
            <p className="about-copy__para">
              Each lighting is a deep conversation with yourself; each thread of
              scent is a lamp on the path of growth.
            </p>
            <p className="about-copy__para">
              Fúmount offers no instant answers, only companionship and space, so
              that amid life&apos;s noise you may walk an inward path and grow in
              what is real.
            </p>
            <p className="about-copy__para">
              The span of one stick of incense: a quiet ground, and a meeting
              with who you truly are.
            </p>
            <p className="about-copy__para">
              Fúmount witnesses every inward leap you make. Practice is not on a
              distant mountain, it lives in each present moment. Fúmount Classics
              are everyday rituals within reach, helping you settle body and mind
              quickly and recover your own rhythm in a crowded world.
            </p>
          </div>
        </div>
      </section>

      <section
        className="about-contact"
        id="contact-us"
        aria-labelledby="contact-us-heading"
      >
        <div className="about-contact__inner">
          <h2 id="contact-us-heading" className="about-contact__title">
            Contact us
          </h2>
          <p className="about-contact__placeholder">
            Placeholder — email, phone, studio hours, and a contact form will
            appear here.
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
