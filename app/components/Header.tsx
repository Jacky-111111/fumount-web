import {Suspense, useEffect, useState, type CSSProperties} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useLanguage} from '~/lib/language';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const location = useLocation();
  const transparentHeader = usesTransparentHeader(location.pathname);
  const scrollProgress = useHeaderScrollProgress();
  const progress = transparentHeader ? scrollProgress : 1;
  const {shop, menu} = header;
  const [languageOpen, setLanguageOpen] = useState(false);
  const {language, toggleLanguage, t} = useLanguage();

  return (
    <>
      <p className="announcement">{t.announcement}</p>
      <header
        className={`site-header${transparentHeader ? ' site-header--transparent' : ' site-header--solid'}`}
        id="siteHeader"
        style={{'--hdr-progress': progress} as CSSProperties}
      >
        <div className="header-stack">
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />

          <div className="header-brand-row">
            <div className="header-brand-left">
              <SearchToggle />
              <span className="header-search-underline" aria-hidden="true" />
            </div>

            <NavLink className="logo" prefetch="intent" to="/" aria-label={t.logoAria}>
              <img
                className="logo__mark"
                src="/fumount-design/images/logo.png"
                alt=""
                width="240"
                height="240"
                decoding="async"
              />
              <span className="logo__word">{shop.name || 'Fúmount'}</span>
            </NavLink>

            <div className="header-tools">
              <AccountLink isLoggedIn={isLoggedIn} />
              <span className="header-tools__divider" aria-hidden="true" />
              <div
                className={`language-switch${languageOpen ? ' is-open' : ''}`}
                id="languageSwitch"
              >
                <button
                  type="button"
                  className="region-pill"
                  id="languageToggle"
                  aria-label={t.languageButtonLabel}
                  aria-haspopup="listbox"
                  aria-expanded={languageOpen}
                  onClick={() => setLanguageOpen((open) => !open)}
                >
                  {t.languageButton} <span className="chev" aria-hidden="true">▼</span>
                </button>
                <div
                  className="language-switch__menu"
                  id="languageMenu"
                  role="listbox"
                  aria-label="Available languages"
                >
                  <button
                    type="button"
                    className="language-switch__option"
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      toggleLanguage();
                      setLanguageOpen(false);
                    }}
                  >
                    {t.languageOption}
                  </button>
                </div>
              </div>
              <span className="header-tools__divider" aria-hidden="true" />
              <CartToggle cart={cart} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const {t} = useLanguage();
  const items = (menu || FALLBACK_HEADER_MENU).items;

  if (viewport === 'mobile') {
    return (
      <nav className="header-menu-mobile" role="navigation">
        <NavLink end onClick={close} prefetch="intent" to="/">
          {t.languageButton === '中文' ? '首页' : 'Home'}
        </NavLink>
        {items.map((item) => {
          const url = normalizeMenuUrl({item, primaryDomainUrl, publicStoreDomain});
          if (!url) return null;
          return (
            <NavLink
              end
              key={item.id}
              onClick={close}
              prefetch="intent"
              to={url}
            >
              {item.title}
            </NavLink>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="nav-row" role="navigation" aria-label={t.navAria}>
      <div className="nav-row__cluster">
        <div className="nav-collections">
          <NavLink
            className="nav-collections__trigger nav-row__collections-link"
            prefetch="intent"
            to="/collections"
          >
            {t.nav[0]} <span className="nav-row__chev" aria-hidden="true">⌵</span>
          </NavLink>
          <ul className="nav-collections__menu" aria-label={t.collectionListAria}>
            {items.slice(0, 4).map((item, index) => {
              const url = normalizeMenuUrl({item, primaryDomainUrl, publicStoreDomain});
              if (!url) return null;
              return (
                <li key={item.id}>
                  <NavLink
                    className="nav-collections__item"
                    prefetch="intent"
                    to={url}
                  >
                    {t.collectionItems[index] ?? item.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="nav-row__strip">
          <NavLink prefetch="intent" to="/collections/all">
            {t.nav[1]}
          </NavLink>
          <NavLink prefetch="intent" to="/collections/all">
            {t.nav[2]}
          </NavLink>
          <NavLink prefetch="intent" to="/collections/all">
            {t.nav[3]}
          </NavLink>
          <NavLink prefetch="intent" to="/collections/all">
            {t.nav[4]}
          </NavLink>
          <NavLink prefetch="intent" to="/blogs/news">
            {t.nav[5]}
          </NavLink>
          <NavLink prefetch="intent" to="/pages/about">
            {t.nav[6]}
          </NavLink>
          <NavLink prefetch="intent" to="/pages/about#contact-us">
            {t.nav[7]}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function usesTransparentHeader(pathname: string) {
  const normalizedPath = pathname.replace(/^\/|\/$/g, '');
  const pathWithoutLocale = normalizedPath.replace(
    /^[a-z]{2}(?:-[a-z]{2})?\//i,
    '',
  );
  return (
    normalizedPath === '' ||
    /^[a-z]{2}(?:-[a-z]{2})?$/i.test(normalizedPath) ||
    pathWithoutLocale === 'pages/about'
  );
}

function useHeaderScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let targetP = 0;
    let currentP = reduceMotion ? readTargetProgress() : 0;
    let rafId: number | null = null;
    const hdrSmooth = 0.072;

    function heroBlendDistance() {
      return Math.max(window.innerHeight * 0.42, 280);
    }

    function readTargetProgress() {
      const d = heroBlendDistance();
      return Math.min(Math.max(window.scrollY / d, 0), 1);
    }

    function tick() {
      rafId = null;
      if (reduceMotion) {
        currentP = targetP;
        setProgress(currentP);
        return;
      }
      const diff = targetP - currentP;
      if (Math.abs(diff) < 0.0004) {
        currentP = targetP;
        setProgress(currentP);
        return;
      }
      currentP += diff * hdrSmooth;
      setProgress(currentP);
      rafId = window.requestAnimationFrame(tick);
    }

    function schedule() {
      targetP = readTargetProgress();
      if (rafId == null) rafId = window.requestAnimationFrame(tick);
    }

    schedule();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return progress;
}

function SearchToggle() {
  const {open} = useAside();
  const {t} = useLanguage();
  return (
    <button
      type="button"
      className="header-search-btn icon-btn"
      aria-label={t.searchAria}
      onClick={() => open('search')}
    >
      <SearchIcon />
    </button>
  );
}

function AccountLink({isLoggedIn}: Pick<HeaderProps, 'isLoggedIn'>) {
  const {t} = useLanguage();
  return (
    <NavLink className="icon-btn" prefetch="intent" to="/account" aria-label={t.accountAria}>
      <Suspense fallback={<AccountIcon />}>
        <Await resolve={isLoggedIn} errorElement={<AccountIcon />}>
          {() => <AccountIcon />}
        </Await>
      </Suspense>
    </NavLink>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const {t} = useLanguage();

  return (
    <a
      className="icon-btn"
      href="/cart"
      aria-label={`${t.bagAria}, ${count}`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <BagIcon />
      <span className="cart-count">{count}</span>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function normalizeMenuUrl({
  item,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  item: NonNullable<HeaderQuery['menu']>['items'][number];
  primaryDomainUrl?: string;
  publicStoreDomain: string;
}) {
  if (!item.url) return null;
  return item.url.includes('myshopify.com') ||
    item.url.includes(publicStoreDomain) ||
    (primaryDomainUrl ? item.url.includes(primaryDomainUrl) : false)
    ? new URL(item.url).pathname
    : item.url;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 8.5h11l1 12h-13l1-12Z" />
      <path d="M9 8.5a3 3 0 0 1 6 0" />
    </svg>
  );
}

const FALLBACK_HEADER_MENU: NonNullable<HeaderQuery['menu']> = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/news',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
