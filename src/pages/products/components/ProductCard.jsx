import { useEffect, useState } from 'react';
import { useCarrito } from '../../../features/cart/useCarrito.js';
import '../../../features/catalog/catalog.css';

const formatPrice = (value) => new Intl.NumberFormat('es-CR', {
  style: 'currency', currency: 'CRC', maximumFractionDigits: 0,
}).format(value);

const identifierValue = (value) => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return value?.code ?? value?.value ?? value?.name ?? null;
};

export default function ProductCard({ product, className = '' }) {
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const { agregar, openCart } = useCarrito();
  const raw = product.crudo ?? {};
  const availableSizes = (product.detalle?.products ?? [])
    .filter((variant) => Number(variant.stock) > 0 && variant.availabilityStatus !== 'out_of_stock')
    .map((variant) => ({
      externalId: variant.externalId,
      size: String(variant.size ?? ''),
      stock: Number(variant.stock),
    }))
    .filter((variant) => variant.size);
  const referenceCode = identifierValue(product.referenceCode ?? raw.referenceCode ?? raw.reference);
  const colorCode = identifierValue(product.colorCode ?? raw.colorCode ?? raw.color);
  const detailUrl = referenceCode && colorCode
    ? `/product?${new URLSearchParams({ referenceCode: String(referenceCode), colorCode: String(colorCode) })}`
    : '/product';

  useEffect(() => {
    if (!sizeModalOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSizeModalOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('product-size-modal-open');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('product-size-modal-open');
    };
  }, [sizeModalOpen]);

  const addWithSize = (variant) => {
    agregar({
      ...product,
      id: variant.externalId ?? product.id,
      referenceCode,
      colorCode,
      nombre: product.nombre,
      imagenes: product.imagenes,
      precio: product.precio,
    }, variant.size);
    window.mdq = window.mdq || [];
    window.mdq.push(['track', 'product_added_to_cart']);
    setSizeModalOpen(false);
    openCart();
  };

  const openSizeModal = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.mdq = window.mdq || [];
    window.mdq.push(['track', 'button_click_add_to_card']);
    window.mdq.push(['track', 'size_modal_opened']);
    setSizeModalOpen(true);
  };

  return (
    <>
      <article className={`products-card ${className}`.trim()}>
        <div className="products-card__media-wrap">
          <a className="products-card__media" href={detailUrl} aria-label={`Ver ${product.nombre}`}>
            {product.imagenes[0]
              ? <img src={product.imagenes[0]} alt={product.nombre} loading="lazy" />
              : <span className="products-card__placeholder">{product.nombre}</span>}
            {product.precioOriginal && <span className="products-card__sale">Oferta</span>}
          </a>
          <button type="button" className="products-card__quick-view" onClick={openSizeModal} aria-label={`Agregar ${product.nombre} al carrito`} aria-expanded={sizeModalOpen}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.75 7.5V6a3.75 3.75 0 1 0-7.5 0v1.5m11.356 1.007 1.263 12A1.125 1.125 0 0 1 19.75 21.75H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              <path d="M12 11.25v6m3-3h-6" />
            </svg>
          </button>
        </div>
        <a className="products-card__body" href={detailUrl} aria-label={`Ver detalles de ${product.nombre}`}>
          {product.marca && <p className="products-card__brand">{product.marca}</p>}
          <h2>{product.nombre}</h2>
          <div className="products-card__prices">
            {product.precio !== null && <strong>{formatPrice(product.precio)}</strong>}
            {product.precioOriginal && <del>{formatPrice(product.precioOriginal)}</del>}
          </div>
        </a>
      </article>

      {sizeModalOpen && (
        <div className="product-size-modal" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSizeModalOpen(false);
        }}>
          <section className="product-size-modal__panel" role="dialog" aria-modal="true" aria-labelledby="size-modal-title">
            <button type="button" className="product-size-modal__close" onClick={() => setSizeModalOpen(false)} aria-label="Cerrar">×</button>
            <div className="product-size-modal__product">
              {product.imagenes[0] && <img src={product.imagenes[0]} alt="" />}
              <h3 id="size-modal-title">{product.nombre}</h3>
            </div>
            <p className="product-size-modal__label">Elija su talla</p>
            {availableSizes.length ? (
              <div className="product-size-modal__sizes">
                {availableSizes.map((variant) => (
                  <button type="button" key={variant.externalId ?? variant.size} onClick={() => addWithSize(variant)}>{variant.size}</button>
                ))}
              </div>
            ) : (
              <p className="product-size-modal__empty">Este producto no tiene tallas disponibles.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
