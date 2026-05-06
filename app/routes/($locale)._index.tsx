import {useEffect, useState, type CSSProperties} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {MockShopNotice} from '~/components/MockShopNotice';
import {ProductPrice} from '~/components/ProductPrice';

const ASSET_BASE = '/fumount-design/images/';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Fúmount | Home incense'},
    {
      name: 'description',
      content:
        'Luxury incense rituals rooted in Eastern wisdom and shaped for modern living.',
    },
  ];
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
  price?: MoneyV2;
  href: string;
};

const fallbackProducts: FeaturedProduct[] = [
  {
    title: 'HOOKED AZURE',
    intention: 'A bright, mineral incense ritual.',
    collection: 'Classic Series',
    image: `${ASSET_BASE}catalogue-1.png`,
    href: '/products/cloud-rest',
  },
  {
    title: 'EXOTIC - Heritage',
    intention: 'Heritage botanicals for grounded focus.',
    collection: 'Classic Series',
    image: `${ASSET_BASE}catalogue-2.png`,
    href: '/products/inner-eye',
  },
  {
    title: 'EXOTIC Paradise',
    intention: 'A warm trail for intimate atmosphere.',
    collection: 'Artisan Series',
    image: `${ASSET_BASE}catalogue-3.png`,
    href: '/products/red-thread',
  },
  {
    title: 'HOOKED POUR HOMME',
    intention: 'A composed ritual for evening clarity.',
    collection: 'Artisan Series',
    image: `${ASSET_BASE}catalogue-4.png`,
    href: '/collections/all',
  },
];

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const homepageProducts =
    data.featuredProducts.length > 0 ? data.featuredProducts : fallbackProducts;

  return (
    <>
      {data.isShopLinked ? null : <MockShopNotice />}
      <main id="collections">
        <section className="hero-slide" aria-label="Featured campaign">
          <div className="hero-slide__media">
            <img
              src={`${ASSET_BASE}rue-home-1.png`}
              alt=""
              width="1280"
              height="1600"
              decoding="async"
            />
          </div>
          <div className="hero-slide__content">
            <p className="hero-slide__kicker">New campaign</p>
            <h1 className="hero-slide__title">The incense collection</h1>
            <Link className="btn-shop" to="#shop">
              Shop now
            </Link>
          </div>
        </section>

        <section
          className="split-flip-section"
          id="atmosphere"
          lang="zh-CN"
          aria-labelledby="split-flip-heading"
        >
          <header className="split-flip-intro">
            <div className="split-flip-intro__hero" aria-hidden="true">
              <img
                src={`${ASSET_BASE}Shoin-Room-Shoji.png`}
                alt=""
                width="1600"
                height="900"
                decoding="async"
              />
            </div>
            <h2 id="split-flip-heading" className="split-flip-intro__title">
              天地人香境
            </h2>
            <p className="split-flip-intro__line">
              以有形之香，缔造无形道场；借由内朝圣之路，达成天地人合一。
            </p>
            <p className="split-flip-intro__line">
              一炷香，便是一方移动的道场。
            </p>
            <p className="split-flip-intro__line">
              以香为引，随地结界；以息为观，向内朝圣。
            </p>
            <p className="split-flip-intro__line">
              在呼吸之间，觉知「人」在当下，承接「地」之厚重，感应「天」之清远。
            </p>
            <p className="split-flip-intro__line">
              烟火起处，即是修行；方寸之间，天地人归位。
            </p>
          </header>

          <div className="split-flip-section__grid">
            <FlipModule
              ariaLabel="Left gallery slides"
              images={[
                `${ASSET_BASE}atmosphere-1.png`,
                `${ASSET_BASE}atmosphere-2.png`,
              ]}
            />
            <FlipModule
              ariaLabel="Right gallery slides"
              images={[
                `${ASSET_BASE}atmosphere-3.png`,
                `${ASSET_BASE}atmosphere-4.png`,
              ]}
            />
          </div>
        </section>

        <ImmersiveScroll />

        <section className="rb-section-products" id="shop">
          <div className="rb-section-products__inner">
            <h2>Best sellers</h2>
            <p className="sub">
              Find your inner peace with our exclusive incense collection.
            </p>

            <div className="product-grid">
              {homepageProducts.slice(0, 4).map((product, index) => (
                <article className="product-card" key={`${product.href}-${product.title}`}>
                  <Link className="product-card__visual" to={product.href}>
                    <span className="badge-sale">{product.collection}</span>
                    <img
                      src={
                        product.image ??
                        `${ASSET_BASE}catalogue-${Math.min(index + 1, 4)}.png`
                      }
                      alt={product.title}
                      width="600"
                      height="600"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </Link>
                  <h3>{product.title}</h3>
                  <p className="product-card__note">{product.intention}</p>
                  <div className="rb-price">
                    <ProductPrice price={product.price} />
                  </div>
                </article>
              ))}
            </div>

            <div className="view-all-wrap">
              <Link className="view-all" to="/collections/all">
                View all
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function FlipModule({images, ariaLabel}: {images: string[]; ariaLabel: string}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="flip-module" data-flip-module>
      <div className="flip-module__viewport">
        {images.map((image, index) => (
          <div
            className={`flip-module__slide${index === activeIndex ? ' is-active' : ''}`}
            key={image}
          >
            <img
              src={image}
              alt=""
              width="1200"
              height="1200"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
        <div className="flip-module__dots" role="tablist" aria-label={ariaLabel}>
          {images.map((image, index) => (
            <button
              type="button"
              className={`flip-module__dot${index === activeIndex ? ' is-active' : ''}`}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Image ${index + 1} of ${images.length}`}
              key={`${image}-dot`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImmersiveScroll() {
  const steps = [
    ['immersive-panel-1.png', 'Relax & Unwind', '晨光初透，香起無聲。'],
    ['immersive-panel-2.png', 'Stillness', '一縷煙，萬象寂。'],
    ['immersive-panel-3.png', 'Depth', '息深處，境自開。'],
    ['immersive-panel-4.png', 'Sanctuary', '方寸之地，即是道場。'],
    ['immersive-panel-5.png', 'Return', '天清地寧，人歸於靜。'],
  ];
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-immersive-scroll]');
    if (!root) return;
    const immersiveRoot = root;

    function update() {
      const rect = immersiveRoot.getBoundingClientRect();
      const vh = window.innerHeight;
      const range = rect.height + vh;
      const passed = vh - rect.top;
      setScrollProgress(Math.min(Math.max(passed / range, 0), 1));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setInView(entry.isIntersecting));
      },
      {threshold: 0.16, rootMargin: '0px 0px -6% 0px'},
    );
    observer.observe(immersiveRoot);
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section
      className={`immersive-scroll${inView ? ' is-in-view' : ''}`}
      id="immersive-story"
      lang="zh-CN"
      aria-labelledby="immersive-scroll-heading"
      data-immersive-scroll
      style={{'--iz-scroll': scrollProgress} as CSSProperties}
    >
      <div className="immersive-scroll__field" aria-hidden="true">
        <div className="immersive-scroll__paper" />
        <div className="immersive-scroll__frost" />
        <div className="immersive-scroll__grain" />
      </div>
      <div className="immersive-scroll__inner">
        <h2 id="immersive-scroll-heading" className="visually-hidden">
          香境行旅
        </h2>
        <div className="immersive-scroll__preface">
          <p className="immersive-scroll__preface-line">
            烟火起处，即是修行；方寸之间，天地人归位。
          </p>
          <p className="immersive-scroll__preface-line immersive-scroll__preface-line--secondary">
            心系天下，与宇宙同频。
          </p>
          <p className="immersive-scroll__preface-line immersive-scroll__preface-line--lead">
            福山，您的内在朝圣之路
          </p>
        </div>
        <div className="immersive-scroll__row">
          {steps.map(([image, en, zh], index) => (
            <article
              className="immersive-step"
              data-immersive-step
              data-step={index + 1}
              key={image}
            >
              <div className="immersive-step__bundle">
                <figure className="immersive-step__panel">
                  <img
                    src={`${ASSET_BASE}${image}`}
                    alt=""
                    width="900"
                    height="1600"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="immersive-step__text">
                  <p className="immersive-step__en">{en}</p>
                  <p className="immersive-step__zh">{zh}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
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
          minVariantPrice: MoneyV2;
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
          minVariantPrice: MoneyV2;
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

  const artisanProducts = (response.artisan?.products.nodes ?? [])
    .slice(0, 2)
    .map((product) => ({
      title: product.title,
      intention:
        getIntentionCopy(product.title) ?? summarizeDescription(product.description),
      collection: 'Artisan Series' as const,
      image: product.featuredImage?.url ?? null,
      price: product.priceRange.minVariantPrice,
      href: `/products/${product.handle}`,
    }));

  return [...classicProducts, ...artisanProducts];
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
