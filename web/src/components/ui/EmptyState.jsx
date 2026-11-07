import PropTypes from 'prop-types';
import Button from './Button';

/** Estado vacío o de error con una acción concreta para seguir. */
export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction, tone = 'neutral' }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-8">
      {Icon && (
        <Icon aria-hidden="true" size={28} className={tone === 'error' ? 'text-danger' : 'text-brand'} />
      )}
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        {message && <p className="mt-1 max-w-prose text-ink-soft">{message}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant={tone === 'error' ? 'outline' : 'primary'} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  tone: PropTypes.oneOf(['neutral', 'error']),
};
