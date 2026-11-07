import { Component } from 'react';
import PropTypes from 'prop-types';

/** Atrapa errores de renderizado para que un fallo no deje la pantalla en blanco. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error de renderizado', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto max-w-lg px-6 py-20">
          <h1 className="text-3xl font-extrabold">Esta pantalla dejó de responder</h1>
          <p className="mt-3 text-ink-soft">Recarga la página. Si vuelve a pasar, vuelve al inicio e intenta de nuevo.</p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-11 rounded-[10px] bg-brand px-4 font-bold text-brand-ink"
            >
              Recargar página
            </button>
            <a href="/" className="grid h-11 place-items-center rounded-[10px] border border-line px-4 font-bold">
              Ir al inicio
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = { children: PropTypes.node };
