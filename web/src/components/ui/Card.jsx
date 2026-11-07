import PropTypes from 'prop-types';

export default function Card({ children, className = '', as: Tag = 'section', ...rest }) {
  return (
    <Tag className={`rounded-2xl border border-line bg-surface p-5 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

Card.propTypes = { children: PropTypes.node, className: PropTypes.string, as: PropTypes.elementType };
