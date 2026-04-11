import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        const isLoading = fetcher.state !== 'idle';
        const isDisabled = disabled ?? isLoading;

        return (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            aria-busy={isLoading}
            className="product-add-to-cart-button"
            data-loading={isLoading ? 'true' : 'false'}
            type="submit"
            onClick={onClick}
            disabled={isDisabled}
          >
            <span>{children}</span>
          </button>
        </>
        );
      }}
    </CartForm>
  );
}
