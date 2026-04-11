import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';
import {MockShopNotice} from '~/components/MockShopNotice';
import {ProductPrice} from '~/components/ProductPrice';
import heroBackground from '~/assets/background_1.png';
import intentionsBackground from '~/assets/background_2.png';
import storyBackground from '~/assets/background_3.png';
import placeholderOne from '~/assets/product_placeholder_1.png';
import placeholderTwo from '~/assets/product_placeholder_2.png';
import placeholderThree from '~/assets/product_placeholder_3.png';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Fumount | Home'}];
};

export async function loader(args: Route.LoaderArgs) {
  const dynamicFeaturedProducts = await args.context.storefront
    .query(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
      variables: {
        classicHandle: 'classic-series',
        artisanHandle: 'artisan-series',
      },
    })
    .then((response) => normalizeFeaturedProducts(response))
    .catch((error: Error) => {
      console.error(error);
      return [];
    });

  return {
    isShopLinked: Boolean(args.context.env.PUBLIC_STORE_DOMAIN),
    featuredProducts: dynamicFeaturedProducts,
  };
}

type FeaturedProduct = {
  title: string;
  intention: string;
  collection: 'Classic Series' | 'Artisan Series';
  image: string | null;
  price?: {
    amount: string;
    currencyCode: string;
  };
  href: string;
};

const featuredProducts: FeaturedProduct[] = [
  {
    title: 'Cloud Rest',
    intention: 'Sleep ritual / evening calm',
    collection: 'Classic Series',
    image: placeholderOne,
    href: '/products/cloud-rest',
  },
  {
    title: 'Inner Eye',
    intention: 'Focus ritual / deep work',
    collection: 'Classic Series',
    image: placeholderTwo,
    href: '/products/inner-eye',
  },
  {
    title: 'Red Thread',
    intention: 'Connection ritual / intimate moments',
    collection: 'Artisan Series',
    image: placeholderThree,
    href: '/products/red-thread',
  },
];

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const homepageProducts =
    data.featuredProducts.length > 0 ? data.featuredProducts : featuredProducts;

  return (
    <div className="home fumount-home">
      {data.isShopLinked ? null : <MockShopNotice />}

      <section className="fumount-hero" aria-labelledby="fumount-hero-title">
        <img
          className="fumount-hero-image"
          src={heroBackground}
          alt="Premium incense ritual atmosphere"
          loading="eager"
        />
        <div className="fumount-hero-overlay" />
        <div className="fumount-hero-content">
          <p className="fumount-overline">FUMOUNT</p>
          <h1 id="fumount-hero-title">
            (Dev) Luxury incense for sleep, focus, and inner ritual.
          </h1>
          <p className="fumount-hero-subheading">
            Rooted in Eastern wisdom. Designed for modern living.
          </p>
          <div className="fumount-hero-cta-group">
            <Link className="fumount-btn fumount-btn-primary" to="/collections/all">
              Shop Rituals
            </Link>
            <Link className="fumount-btn fumount-btn-secondary" to="/pages/about">
              Explore the Brand
            </Link>
          </div>
        </div>
      </section>

      <section className="fumount-section" aria-labelledby="featured-intentions">
        <header className="fumount-section-header">
          <p className="fumount-overline">Intentions</p>
          <h2 id="featured-intentions">Featured intentions</h2>
        </header>
        <div className="fumount-intention-grid">
          <article className="fumount-intention-card">
            <img src={intentionsBackground} alt="Sleep intention" loading="lazy" />
            <div>
              <h3>Sleep</h3>
              <p>Ease into quieter evenings and gentle rest rituals.</p>
            </div>
          </article>
          <article className="fumount-intention-card">
            <img src={intentionsBackground} alt="Focus intention" loading="lazy" />
            <div>
              <h3>Focus</h3>
              <p>Create a clear atmosphere for reading, work, and meditation.</p>
            </div>
          </article>
          <article className="fumount-intention-card">
            <img src={intentionsBackground} alt="Connection intention" loading="lazy" />
            <div>
              <h3>Connection</h3>
              <p>Set the tone for presence, warmth, and meaningful moments.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="fumount-section" aria-labelledby="brand-values">
        <header className="fumount-section-header">
          <p className="fumount-overline">Values</p>
          <h2 id="brand-values">Crafted with intention</h2>
        </header>
        <ul className="fumount-values-list">
          <li>Natural botanicals, nothing synthetic</li>
          <li>Handcrafted in small batches</li>
          <li>Designed for ritual, not routine</li>
          <li>A slower way to live and breathe</li>
        </ul>
      </section>

      <section className="fumount-section" aria-labelledby="featured-products">
        <header className="fumount-section-header">
          <p className="fumount-overline">Classic & Artisan</p>
          <h2 id="featured-products">Featured products</h2>
        </header>
        <div className="fumount-products-grid">
          {homepageProducts.map((product) => (
            <article className="fumount-product-card" key={product.title}>
              <Link to={product.href} aria-label={`View ${product.title}`}>
                <img
                  src={product.image ?? placeholderOne}
                  alt={product.title}
                  loading="lazy"
                />
              </Link>
              <div className="fumount-product-content">
                <p className="fumount-product-collection">{product.collection}</p>
                <h3>{product.title}</h3>
                <p>{product.intention}</p>
                <ProductPrice price={product.price} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fumount-section fumount-ritual" aria-labelledby="ritual-steps">
        <header className="fumount-section-header">
          <p className="fumount-overline">Ritual</p>
          <h2 id="ritual-steps">A simple three-step rhythm</h2>
        </header>
        <ol className="fumount-ritual-list">
          <li>
            <h3>Light</h3>
            <p>Begin with intention and let the atmosphere shift.</p>
          </li>
          <li>
            <h3>Breathe</h3>
            <p>Settle into the scent and return to the present moment.</p>
          </li>
          <li>
            <h3>Settle</h3>
            <p>Allow stillness to unfold in your space and mind.</p>
          </li>
        </ol>
      </section>

      <section className="fumount-section fumount-story" aria-labelledby="brand-story-preview">
        <img
          className="fumount-story-image"
          src={storyBackground}
          alt="Fumount brand story atmosphere"
          loading="lazy"
        />
        <div className="fumount-story-content">
          <p className="fumount-overline">Brand Story</p>
          <h2 id="brand-story-preview">Rooted in Eastern wisdom, shaped for today.</h2>
          <p>
            Fumount is a modern incense brand rooted in Eastern wisdom and
            refined for contemporary living.
          </p>
          <Link className="fumount-btn fumount-btn-secondary" to="/pages/about">
            Read the Story
          </Link>
        </div>
      </section>

      <footer className="fumount-home-footer" aria-label="Homepage footer links">
        <Link to="/collections/all">Shop</Link>
        <Link to="/pages/about">About</Link>
        <Link to="/pages/ritual">Ritual</Link>
        <Link to="/pages/contact">Contact</Link>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          Instagram
        </a>
      </footer>
    </div>
  );
}

type FeaturedProductsQueryResponse = {
  classic: {
    title: string;
    products: {
      nodes: Array<{
        title: string;
        handle: string;
        description: string;
        featuredImage: {url: string; altText: string | null} | null;
        priceRange: {
          minVariantPrice: {
            amount: string;
            currencyCode: string;
          };
        };
      }>;
    };
  } | null;
  artisan: {
    title: string;
    products: {
      nodes: Array<{
        title: string;
        handle: string;
        description: string;
        featuredImage: {url: string; altText: string | null} | null;
        priceRange: {
          minVariantPrice: {
            amount: string;
            currencyCode: string;
          };
        };
      }>;
    };
  } | null;
};

function normalizeFeaturedProducts(response: FeaturedProductsQueryResponse) {
  const classicProducts = (response.classic?.products.nodes ?? [])
    .slice(0, 2)
    .map((product) => ({
      title: product.title,
      intention:
        getIntentionCopy(product.title) ?? summarizeDescription(product.description),
      collection: 'Classic Series' as const,
      image: product.featuredImage?.url ?? null,
      price: product.priceRange.minVariantPrice,
      href: `/products/${product.handle}`,
    }));

  const artisanProduct = (response.artisan?.products.nodes ?? [])
    .slice(0, 1)
    .map((product) => ({
      title: product.title,
      intention:
        getIntentionCopy(product.title) ?? summarizeDescription(product.description),
      collection: 'Artisan Series' as const,
      image: product.featuredImage?.url ?? null,
      price: product.priceRange.minVariantPrice,
      href: `/products/${product.handle}`,
    }));

  return [...classicProducts, ...artisanProduct];
}

function getIntentionCopy(title: string) {
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle.includes('cloud rest')) return 'Sleep ritual / evening calm';
  if (normalizedTitle.includes('inner eye')) return 'Focus ritual / deep work';
  if (normalizedTitle.includes('red thread')) {
    return 'Connection ritual / intimate moments';
  }
  return null;
}

function summarizeDescription(description: string) {
  if (!description) return 'A refined ritual incense for intentional living.';
  return description.split('.').filter(Boolean)[0] + '.';
}

const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query HomepageFeaturedProducts(
    $country: CountryCode
    $language: LanguageCode
    $classicHandle: String!
    $artisanHandle: String!
  ) @inContext(country: $country, language: $language) {
    classic: collection(handle: $classicHandle) {
      title
      products(first: 6) {
        nodes {
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
    artisan: collection(handle: $artisanHandle) {
      title
      products(first: 6) {
        nodes {
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;
