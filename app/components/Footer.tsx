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
          const policyLinks = menu.items
            .map((item) =>
              normalizeMenuLink({item, primaryDomainUrl, publicStoreDomain}),
            )
            .filter(isFooterLink);

          return (
            <footer className="site-footer-rb">
              <div className="footer-grid">
                <div className="footer-brand">
                  <NavLink className="footer-logo" prefetch="intent" to="/">
                    <span className="footer-logo__word">Fúmount</span>
                  </NavLink>
                  <div className="footer-rule" />
                  <div className="footer-social">
                    <a href="https://facebook.com" aria-label="Facebook">
                      f
                    </a>
                    <a href="https://instagram.com" aria-label="Instagram">
                      in
                    </a>
                    <a href="https://youtube.com" aria-label="YouTube">
                      ▶
                    </a>
                    <a href="https://tiktok.com" aria-label="TikTok">
                      ♪
                    </a>
                  </div>
                  <a href="https://shop.app" className="footer-follow-shop">
                    Follow on shop
                  </a>
                </div>

                <FooterMenuColumn title="Policies" links={policyLinks} />
                <FooterMenuColumn title="Find out more" links={MORE_LINKS} />
              </div>

              <div className="footer-pay" aria-hidden="true">
                <span className="pay-badge">Amex</span>
                <span className="pay-badge">Apple Pay</span>
                <span className="pay-badge">Discover</span>
                <span className="pay-badge">G Pay</span>
                <span className="pay-badge">Mastercard</span>
                <span className="pay-badge">Shop Pay</span>
                <span className="pay-badge">Visa</span>
              </div>

              <p className="footer-copy">
                © {new Date().getFullYear()}, Fúmount · All rights reserved
              </p>
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
    <div className="footer-col">
      <h3>{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            {link.external ? (
              <a href={link.url} rel="noopener noreferrer" target="_blank">
                {link.title}
              </a>
            ) : (
              <NavLink end prefetch="intent" to={link.url}>
                {link.title}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </div>
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

const MORE_LINKS = [
  {id: 'more-about', title: 'About us', url: '/pages/about', external: false},
  {
    id: 'more-contact',
    title: 'Contact us',
    url: '/pages/about#contact-us',
    external: false,
  },
  {id: 'more-stockists', title: 'Stockists', url: '/pages/contact', external: false},
  {id: 'more-press', title: 'Press', url: '/blogs/journal', external: false},
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
