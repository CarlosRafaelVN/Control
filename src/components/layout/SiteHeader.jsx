import { useCarrito } from '../../features/cart/useCarrito.js';
import { navItems } from '../../data/homePageData.js';

const navHrefs = {
  Novedades: '/products',
  Mujer: '/products?gender=femenino',
  Hombre: '/products?gender=masculino',
  Niños: '/products?gender=ninos',
  Marcas: '/#brands',
  Nosotros: '/#about',
  Ofertas: '/products?offers=1',
};

export default function SiteHeader() {
  const { cantidadTotal, openCart } = useCarrito();

  return (
    <header className="site-header sticky top-0 z-40 border-b border-black/10 bg-white">
      <div className="overflow-x-auto bg-[#e51f2b] text-white">
        <div className="mx-auto flex min-h-[46px] w-max items-center justify-center gap-6 px-4 text-[14px] font-semibold lg:gap-8">
          <a className="flex shrink-0 items-center gap-2" href="https://wa.me/50660651818" target="_blank" rel="noreferrer">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20l1.2-4.4A8.4 8.4 0 1 1 20 11.5Z" /><path d="M8.5 8.5c.5 2.7 2.3 4.5 5 5" /></svg>
            WhatsApp
          </a>
          <a className="flex shrink-0 items-center gap-2" href="https://www.tiktok.com/@cachoscr" target="_blank" rel="noreferrer">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.6 7.2a6.8 6.8 0 0 1-4.2-2V15a5.6 5.6 0 1 1-5.6-5.6c.4 0 .8 0 1.2.1v3.2a2.5 2.5 0 1 0 1.7 2.4V2h3.2c.3 2 1.6 3.6 3.7 4.1v1.1Z" /></svg>
            Tiktok
          </a>
          <a className="flex shrink-0 items-center gap-2" href="https://www.instagram.com/cachoscr/" target="_blank" rel="noreferrer">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
            Instagram
          </a>
          <a className="flex shrink-0 items-center gap-2" href="https://www.facebook.com/cachoscr/" target="_blank" rel="noreferrer">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" /></svg>
            Facebook
          </a>
          <a className="flex shrink-0 items-center gap-2" href="tel:+50660651818">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a15 15 0 0 0 6 6L16 13l5 2v4c0 1.1-.9 2-2 2C10 20.5 3.5 14 3 5c0-1.1.9-2 2-2Z" /></svg>
            Contacto
          </a>
          <a className="flex shrink-0 items-center gap-2" href={/* https://www.cachoscr.com/pages/store-locator */ undefined}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            Ubicaciones tiendas
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 py-4 lg:px-6">
        <a href="/" className="col-start-2 justify-self-center" aria-label="Cachos inicio">
          <img
            src="https://cms.blumewebsites.com/cachos/website/logo.png"
            alt="Cachos"
            className="h-10 w-auto max-w-[150px] object-contain"
          />
        </a>

        <div className="col-start-3 flex items-center justify-self-end gap-3">
          <button type="button" aria-label="Buscar" className="site-header__icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
          </button>
          <a href={/* https://www.cachoscr.com/s/login */ undefined} aria-label="Iniciar sesión" className="site-header__icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.1 3.2-5 7-5s6.3 1.9 7 5" /></svg>
          </a>
          <button type="button" aria-label={`Ver carrito, ${cantidadTotal} productos`} className="site-header__icon site-header__cart" onClick={openCart}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {cantidadTotal > 0 && <span>{cantidadTotal}</span>}
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-6 overflow-x-auto border-t border-black/10 px-4 py-3 lg:justify-center lg:gap-10 lg:px-6" aria-label="Navegación principal">
        {navItems.map((item) => (
          <a
            href={navHrefs[item] ?? '/products'}
            key={item}
            className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-black transition hover:opacity-70"
            style={item === 'Ofertas' ? { color: '#DF1F25' } : undefined}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}