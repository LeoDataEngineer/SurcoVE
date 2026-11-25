import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { cargarGold } from './lib/gold'
import { seccionDesdeRuta } from './lib/navegacion'
import './index.css'

function Pantalla({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-hoja">SurcoVE</p>
      <h1 className="font-display text-2xl font-bold">{titulo}</h1>
      <p className="max-w-md text-sm text-white/60">{texto}</p>
    </main>
  )
}

const raiz = createRoot(document.getElementById('root')!)
raiz.render(<Pantalla titulo="Preparando la brújula" texto="Cargando los datos climáticos..." />)

cargarGold()
  .then(() => raiz.render(
    <StrictMode>
      <App seccion={seccionDesdeRuta(window.location.pathname)} />
    </StrictMode>,
  ))
  .catch((error: unknown) => {
    console.error('No se pudieron cargar los datos de SurcoVE', error)
    raiz.render(
      <Pantalla
        titulo="No se pudieron cargar los datos"
        texto="Revisa tu conexión e inténtalo de nuevo. Para usar la app sin red, ábrela primero con conexión para guardar los datos en el dispositivo."
      />,
    )
  })

// El modo campo solo se registra en la build de producción: en desarrollo el
// service worker guardaría los módulos de Vite en caché y mostraría código viejo.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
        // La app funciona igual sin service worker.
      })
    })
  } else {
    // Si quedó registrado de una sesión anterior, lo quitamos para no ver código viejo.
    navigator.serviceWorker.getRegistrations()
      .then((registros) => registros.forEach((registro) => registro.unregister()))
      .catch(() => {})
  }
}
