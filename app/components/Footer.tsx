import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

type FooterLink = {id: string; title: string; url: string; external: boolean};

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => {
          const menu = footer?.menu ?? FALLBACK_FOOTER_MENU;
          const primaryDomainUrl = header.shop.primaryDomain?.url;
          const shopName = header.shop.name || 'Fumount';

          const shopLinks = menu.items
            .map((item) =>
              normalizeMenuLink({item, primaryDomainUrl, publicStoreDomain}),
            )
            .filter(isFooterLink);

          return (
            <footer className="footer" aria-labelledby="footer-brand-title">
              <div className="footer-container">
                <section className="footer-brand">
                  <p className="footer-overline">FUMOUNT</p>
                  <h2 id="footer-brand-title">{shopName}</h2>
                  <p>
                    Luxury incense crafted for modern rituals, intentional living,
                    and a calmer atmosphere.
                  </p>
                </section>

                <FooterMenuColumn title="Shop" links={shopLinks} />
                <FooterMenuColumn title="Support" links={SUPPORT_LINKS} />
                <FooterMenuColumn title="Connect" links={CONNECT_LINKS} />
              </div>

              <div className="footer-legal">
                <p>© {new Date().getFullYear()} Fumount. All rights reserved.</p>
                <nav className="footer-legal-links" aria-label="Footer legal links">
                  <NavLink prefetch="intent" to="/policies/privacy-policy">
                    Privacy
                  </NavLink>
                  <NavLink prefetch="intent" to="/policies/terms-of-service">
                    Terms
                  </NavLink>
                  <NavLink prefetch="intent" to="/policies/shipping-policy">
                    Shipping
                  </NavLink>
                </nav>
              </div>
            </footer>
          );
        }}
      </Await>
    </Suspense>
  );
}

function FooterMenuColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<FooterLink>;
}) {
  return (
    <section className="footer-column">
      <h3>{title}</h3>
      <nav role="navigation" className="footer-menu">
        {links.map((link) =>
          link.external ? (
            <a href={link.url} key={link.id} rel="noopener noreferrer" target="_blank">
              {link.title}
            </a>
          ) : (
            <NavLink end key={link.id} prefetch="intent" to={link.url}>
              {link.title}
            </NavLink>
          ),
        )}
      </nav>
    </section>
  );
}

function normalizeMenuLink({
  item,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  item: NonNullable<FooterQuery['menu']>['items'][number];
  primaryDomainUrl?: string;
  publicStoreDomain: string;
}): FooterLink | null {
  if (!item.url) return null;
  const isInternal =
    item.url.includes('myshopify.com') ||
    item.url.includes(publicStoreDomain) ||
    (primaryDomainUrl ? item.url.includes(primaryDomainUrl) : false);
  const url = isInternal ? new URL(item.url).pathname : item.url;
  return {
    id: item.id,
    title: item.title,
    url,
    external: !url.startsWith('/'),
  };
}

function isFooterLink(item: FooterLink | null): item is FooterLink {
  return item !== null;
}

const SUPPORT_LINKS = [
  {id: 'support-search', title: 'Search', url: '/search', external: false},
  {id: 'support-account', title: 'Account', url: '/account', external: false},
  {
    id: 'support-contact',
    title: 'Contact',
    url: '/pages/contact',
    external: false,
  },
] as const;

const CONNECT_LINKS = [
  {
    id: 'connect-email',
    title: 'hello@example.com',
    url: 'mailto:hello@example.com',
    external: true,
  },
  {
    id: 'connect-instagram',
    title: 'Instagram',
    url: 'https://instagram.com',
    external: true,
  },
] as const;

const FALLBACK_FOOTER_MENU: NonNullable<FooterQuery['menu']> = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
