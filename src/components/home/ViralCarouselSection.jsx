import { useState } from 'react';
import { formatPrice } from '../../utils/formatPrice.js';

export default function ViralCarouselSection({ products }) {
  const [activeIndex, setActiveIndex] = useState(3);
  const [soundEnabledId, setSoundEnabledId] = useState(null);
  const previousIndex = (activeIndex - 1 + products.length) % products.length;
  const nextIndex = (activeIndex + 1) % products.length;
  const visibleProducts = [
    { product: products[previousIndex], index: previousIndex },
    { product: products[activeIndex], index: activeIndex },
    { product: products[nextIndex], index: nextIndex },
  ];

  const changeSlide = (direction) => {
    setActiveIndex((current) => (current + direction + products.length) % products.length);
    setSoundEnabledId(null);
  };

  return (
    <section className="viral-section" aria-label="Los más virales">
      <h2 className="viral-section__title">Los más virales</h2>
      <div className="viral-carousel">
        <div className="viral-carousel__slides">
          {visibleProducts.map(({ product, index }) => {
            const isActive = index === activeIndex;

            return (
              <article
                className={`viral-carousel__slide${isActive ? ' is-active' : ''}`}
                key={product.name}
                aria-label={product.name}
              >
                <div className="viral-carousel__media">
                  <video
                    ref={(video) => {
                      if (video) video.volume = 0.05;
                    }}
                    autoPlay
                    loop
                    muted={soundEnabledId !== product.name}
                    playsInline
                    preload="metadata"
                    poster={product.image}
                    src={product.video}
                    aria-label={`Video de ${product.name}`}
                  />
                  {isActive ? (
                    <button
                      className="viral-carousel__sound"
                      type="button"
                      aria-label={soundEnabledId === product.name ? 'Silenciar video' : 'Activar sonido'}
                      onClick={() => setSoundEnabledId((current) => (
                        current === product.name ? null : product.name
                      ))}
                    >
                      {soundEnabledId === product.name ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M11 5 6 9H3v6h3l5 4V5Zm4 4 5 6m0-6-5 6" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M11 5 6 9H3v6h3l5 4V5Zm4 4a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      className="viral-carousel__select"
                      type="button"
                      aria-label={`Ver ${product.name}`}
                      onClick={() => setActiveIndex(index)}
                    />
                  )}
                </div>

                <div className="viral-carousel__product">
                  <a className="viral-carousel__thumb" href={product.href} aria-label={product.name}>
                    <img src={product.image} alt="" loading="lazy" />
                  </a>
                  <div className="viral-carousel__details">
                    <a className="viral-carousel__product-link" href={product.href}>
                      <span className="viral-carousel__name">{product.name}</span>
                      <span className="viral-carousel__price">{formatPrice(product.price)}</span>
                    </a>
                    <a className="viral-carousel__more" href={product.catalogHref}>
                      <span aria-hidden="true">⌃</span>
                      Ver todos ({product.count})
                    </a>
                  </div>
                  <a className="viral-carousel__add" href={product.href} aria-label={`Ver ${product.name}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.25 8V6.75a3.75 3.75 0 0 1 7.5 0V8m4.2 1.1 1.1 10.1a1 1 0 0 1-1 1.1H5.95a1 1 0 0 1-1-1.1l1.1-10.1a1 1 0 0 1 1-.9h11.9a1 1 0 0 1 1 .9ZM12 12v5m2.5-2.5h-5" />
                    </svg>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <button
          className="viral-carousel__arrow viral-carousel__arrow--previous"
          type="button"
          aria-label="Videos virales anteriores"
          onClick={() => changeSlide(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button
          className="viral-carousel__arrow viral-carousel__arrow--next"
          type="button"
          aria-label="Siguientes videos virales"
          onClick={() => changeSlide(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </section>
  );
}
