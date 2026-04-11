import type {Route} from './+types/($locale).collections.all';
import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import type {
  ProductCollectionSortKeys,
  ProductFilter,
  ProductSortKeys,
} from '@shopify/hydrogen/storefront-api-types';

export const meta: Route.MetaFunction = () => {
  return [{title: `Hydrogen | Products`}];
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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {
    // Shopify Storefront API max page size is 250.
    pageBy: 250,
  });
  const appliedFilterInputs = url.searchParams.getAll('filter');
  const parsedFilters = parseProductFilters(appliedFilterInputs);
  const sort = getSortOptions(url.searchParams);

  const {collection} = await storefront.query(CATALOG_QUERY, {
    variables: {
      handle: 'all',
      ...paginationVariables,
      filters: parsedFilters,
      sortKey: sort.sortKey,
      reverse: sort.reverse,
    },
  });

  if (!collection) {
    // Some stores do not have an "all" collection handle.
    // Fallback to the root products query to keep /collections/all functional.
    const fallback = await storefront.query(CATALOG_FALLBACK_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey: toProductSortKey(sort.sortKey),
        reverse: sort.reverse,
      },
    });

    return {
      collection: {
        id: 'fallback-products-all',
        handle: 'all',
        title: 'Products',
        products: {
          ...fallback.products,
          filters: [],
        },
      },
      appliedFilterInputs: [],
      currentSort: sort,
      supportsFilters: false,
    };
  }

  return {
    collection,
    appliedFilterInputs,
    currentSort: sort,
    supportsFilters: true,
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
  const {collection, appliedFilterInputs, currentSort, supportsFilters} =
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

  return (
    <div className="collection">
      <h1>Products</h1>
      <section className="collection-toolbar" aria-label="Collection controls">
        <form className="collection-sort-form" method="get">
          {appliedFilterInputs.map((filter, index) => (
            <input
              key={`${filter}-${index}`}
              type="hidden"
              name="filter"
              value={filter}
            />
          ))}
          <label htmlFor="collection-all-sort">Sort by</label>
          <select
            id="collection-all-sort"
            name="sort"
            defaultValue={selectedSortValue}
            onChange={(event) => {
              const [sortKey, direction] = event.currentTarget.value.split(':');
              const reverseInput = event.currentTarget.form?.elements.namedItem(
                'reverse',
              ) as HTMLInputElement | null;
              if (reverseInput) {
                reverseInput.value = direction === 'desc' ? 'true' : 'false';
              }
              const pageInput = event.currentTarget.form?.elements.namedItem(
                'page',
              ) as HTMLInputElement | null;
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
          <input
            type="hidden"
            name="reverse"
            defaultValue={currentSort.reverse ? 'true' : 'false'}
          />
          <input type="hidden" name="page" defaultValue="1" />
        </form>
      </section>

      {supportsFilters && collection.products.filters?.length ? (
        <section className="collection-filters" aria-label="Collection filters">
          {collection.products.filters.map((filter) => (
            <div className="collection-filter-group" key={filter.id}>
              <h3>{filter.label}</h3>
              <div className="collection-filter-options">
                {filter.values.slice(0, 12).map((value) => {
                  const nextSearchParams = new URLSearchParams();
                  nextSearchParams.set('sort', currentSort.sortKey);
                  nextSearchParams.set(
                    'reverse',
                    currentSort.reverse ? 'true' : 'false',
                  );
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

      <PaginatedResourceSection<CollectionItemFragment>
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
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
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
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
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
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
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
          ...CollectionItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;

const CATALOG_FALLBACK_QUERY = `#graphql
  query CatalogFallback(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
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

function toProductSortKey(sortKey: ProductCollectionSortKeys): ProductSortKeys {
  switch (sortKey) {
    case 'BEST_SELLING':
      return 'BEST_SELLING';
    case 'CREATED':
      return 'CREATED_AT';
    case 'ID':
      return 'ID';
    case 'PRICE':
      return 'PRICE';
    case 'RELEVANCE':
      return 'RELEVANCE';
    case 'TITLE':
      return 'TITLE';
    case 'COLLECTION_DEFAULT':
    default:
      return 'BEST_SELLING';
  }
}
