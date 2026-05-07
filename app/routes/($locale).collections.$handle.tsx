import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import type {ProductItemFragment} from 'storefrontapi.generated';
import type {
  ProductFilter,
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
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
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {
    // Shopify Storefront API standard max page size is 250.
    // This makes collection pages show as many products as possible before "Load more".
    pageBy: 250,
  });
  const appliedFilterInputs = url.searchParams.getAll('filter');
  const parsedFilters = parseProductFilters(appliedFilterInputs);
  const sort = getSortOptions(url.searchParams);

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        filters: parsedFilters,
        sortKey: sort.sortKey,
        reverse: sort.reverse,
      },
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    appliedFilterInputs,
    currentSort: sort,
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

export default function Collection() {
  const {collection, appliedFilterInputs, currentSort} =
    useLoaderData<typeof loader>();
  const sortOptions: Array<{
    label: string;
    value: ProductCollectionSortKeys;
    reverse: boolean;
  }> = [
    {label: 'Featured', value: 'COLLECTION_DEFAULT', reverse: false},
    {label: 'Newest', value: 'CREATED', reverse: true},
    {label: 'Price: Low to High', value: 'PRICE', reverse: false},
    {label: 'Price: High to Low', value: 'PRICE', reverse: true},
    {label: 'Title: A-Z', value: 'TITLE', reverse: false},
    {label: 'Title: Z-A', value: 'TITLE', reverse: true},
    {label: 'Best Selling', value: 'BEST_SELLING', reverse: false},
  ];
  const selectedSortValue = `${currentSort.sortKey}:${currentSort.reverse ? 'desc' : 'asc'}`;
  type CollectionFilter = NonNullable<typeof collection.products.filters>[number];
  type CollectionFilterValue = CollectionFilter['values'][number];

  return (
    <div className="collection">
      <h1>{collection.title}</h1>
      <p className="collection-description">{collection.description}</p>
      <section className="collection-toolbar" aria-label="Collection controls">
        <form className="collection-sort-form" method="get">
          {appliedFilterInputs.map((filter) => (
            <input key={filter} type="hidden" name="filter" value={filter} />
          ))}
          <label htmlFor="collection-sort">Sort by</label>
          <select
            id="collection-sort"
            name="sort"
            defaultValue={selectedSortValue}
            onChange={(event) => {
              const [sortKey, direction] = event.currentTarget.value.split(':');
              const reverseInput = (
                event.currentTarget.form?.elements.namedItem('reverse') as HTMLInputElement | null
              );
              if (reverseInput) {
                reverseInput.value = direction === 'desc' ? 'true' : 'false';
              }
              const pageInput = event.currentTarget.form?.elements.namedItem('page') as HTMLInputElement | null;
              if (pageInput) pageInput.value = '1';
              event.currentTarget.form?.requestSubmit();
            }}
          >
            {sortOptions.map((option) => (
              <option
                key={`${option.value}-${option.reverse ? 'desc' : 'asc'}`}
                value={`${option.value}:${option.reverse ? 'desc' : 'asc'}`}
              >
                {option.label}
              </option>
            ))}
          </select>
          <input type="hidden" name="reverse" defaultValue={currentSort.reverse ? 'true' : 'false'} />
          <input type="hidden" name="page" defaultValue="1" />
        </form>
      </section>

      {collection.products.filters?.length ? (
        <section className="collection-filters" aria-label="Collection filters">
          {collection.products.filters.map((filter: CollectionFilter) => (
            <div className="collection-filter-group" key={filter.id}>
              <h3>{filter.label}</h3>
              <div className="collection-filter-options">
                {filter.values.slice(0, 12).map((value: CollectionFilterValue) => {
                  const nextSearchParams = new URLSearchParams();
                  nextSearchParams.set('sort', currentSort.sortKey);
                  nextSearchParams.set('reverse', currentSort.reverse ? 'true' : 'false');
                  const alreadySelected = appliedFilterInputs.includes(value.input);
                  const nextFilters = alreadySelected
                    ? appliedFilterInputs.filter((item) => item !== value.input)
                    : [...appliedFilterInputs, value.input];
                  nextFilters.forEach((entry) =>
                    nextSearchParams.append('filter', entry),
                  );

                  const href = `?${nextSearchParams.toString()}`;
                  return (
                    <Link
                      className={`collection-filter-chip${alreadySelected ? ' active' : ''}`}
                      key={value.id}
                      prefetch="intent"
                      to={href}
                    >
                      {value.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <PaginatedResourceSection<ProductItemFragment>
        connection={collection.products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 12 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;

function parseProductFilters(inputs: string[]): ProductFilter[] {
  return inputs.flatMap((input) => {
    try {
      return [JSON.parse(input) as ProductFilter];
    } catch {
      return [];
    }
  });
}

function getSortOptions(searchParams: URLSearchParams): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  const rawSort = searchParams.get('sort') ?? '';
  const [rawSortKey, rawDirection] = rawSort.split(':');
  const allowedSortKeys: ProductCollectionSortKeys[] = [
    'COLLECTION_DEFAULT',
    'BEST_SELLING',
    'CREATED',
    'ID',
    'PRICE',
    'RELEVANCE',
    'TITLE',
  ];

  const sortKey = allowedSortKeys.includes(rawSortKey as ProductCollectionSortKeys)
    ? (rawSortKey as ProductCollectionSortKeys)
    : 'COLLECTION_DEFAULT';

  const reverseFromSort =
    rawDirection === 'desc' ? true : rawDirection === 'asc' ? false : null;
  const reverse =
    reverseFromSort !== null
      ? reverseFromSort
      : searchParams.get('reverse') === 'true';

  return {sortKey, reverse};
}
