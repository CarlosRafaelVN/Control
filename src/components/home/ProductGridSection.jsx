import { useRef } from 'react';
import { formatPrice } from '../../utils/formatPrice.js';
import ProductCard from '../../pages/products/components/ProductCard.jsx';
import { STATIC_HOME_PRODUCTS } from '../../data/staticProducts.js';

const columnClasses = {
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
};

export default function ProductGridSection({
  title,
  products,
  subtitle,
  columns = 4,
  variant,
}) {
  const bestSellersTrack = useRef(null);
  const isBestSellers = title === 'Lo más buscado';
  const isLook = variant === 'look';
  const isCarousel = isBestSellers || isLook;
  const normalizeBestSeller = (product) => {
    const staticProduct = STATIC_HOME_PRODUCTS.find((item) => item.nombre === product.name);
    if (staticProduct) {
      return {
        ...staticProduct,
        precio: product.price,
        precioOriginal: product.oldPrice ?? staticProduct.precioOriginal,
      };
    }

    const url = new URL(product.href ?? '/product', window.location.origin);
    return {
      id: product.name,
      referenceCode: url.searchParams.get('referenceCode'),
      colorCode: url.searchParams.get('colorCode'),
      nombre: product.name,
      marca: product.brand,
      precio: product.price,
      precioOriginal: product.oldPrice ?? null,
      imagenes: product.image ? [product.image] : [],
      detalle: { products: [] },
    };
  };

  const headerClass = isCarousel
    ? 'best-sellers__header'
    : 'mb-6 flex items-end justify-between gap-4';

  return (
    <section className={`mx-auto ${isBestSellers ? 'best-sellers-section' : isLook ? 'look-section' : 'max-w-[1600px] px-4 py-8 md:px-6 lg:py-12'}`}>
      <div className={headerClass}>
        <div>
          <h2 className={isCarousel ? 'best-sellers__title' : 'text-[1.8rem] font-black uppercase leading-[1.1] tracking-[-0.07em] text-black md:text-[2.5rem]'}>
            {title}
          </h2>
          {subtitle && (
            isCarousel ? (
              <p className="best-sellers__subtitle">{subtitle}</p>
            ) : (
              <span className="text-[11px] uppercase tracking-[0.12em] text-black/60">{subtitle}</span>
            )
          )}
        </div>
      </div>

      {isCarousel ? (
        <div className="best-sellers__carousel">
          <button
            className="best-sellers__arrow best-sellers__arrow--previous"
            type="button"
            aria-label="Productos anteriores"
            onClick={() => bestSellersTrack.current?.scrollBy({ left: -bestSellersTrack.current.clientWidth, behavior: 'smooth' })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="best-sellers__track" ref={bestSellersTrack}>
            {products.map((product) => isBestSellers ? (
              <ProductCard
                key={product.name}
                className="best-sellers__card"
                product={normalizeBestSeller(product)}
              />
            ) : (
              <article className="best-sellers__card" key={product.name}>
                <a className="best-sellers__image-link" href={product.href ?? '#'} aria-label={product.name}>
                  <img src={product.image} alt={product.name} loading="lazy" />
                </a>
                <a className="best-sellers__name" href={product.href ?? '#'}>{product.name}</a>
                <div className="best-sellers__prices">
                  <span>{formatPrice(product.price)}</span>
                  {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
                </div>
              </article>
            ))}
          </div>
          <button
            className="best-sellers__arrow best-sellers__arrow--next"
            type="button"
            aria-label="Siguientes productos"
            onClick={() => bestSellersTrack.current?.scrollBy({ left: bestSellersTrack.current.clientWidth, behavior: 'smooth' })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      ) : (
        <div className={`grid gap-5 md:grid-cols-2 ${columnClasses[columns] ?? columnClasses[4]}`}>
          {products.map((product) => (
            <article key={product.name} className="overflow-hidden rounded-[18px] border border-black/10 bg-white transition hover:-translate-y-1">
              <img src={product.image} alt={product.name} loading="lazy" className="h-[260px] w-full object-cover" />
              <h3 className="px-4 pt-4 text-[0.88rem] font-bold uppercase leading-[1.35] tracking-[0.03em] text-black">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 px-4 pb-4 pt-3 text-sm font-extrabold">
                <strong className="text-black">{formatPrice(product.price)}</strong>
                {product.oldPrice && <span className="text-black/40 line-through">{formatPrice(product.oldPrice)}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
      {isLook && (
        <a className="look-section__all" href="https://www.cachoscr.com/catalog?productType=ACCESORIO">
          Ver todos los accesorios <span aria-hidden="true">→</span>
        </a>
      )}
    </section>
  );
}