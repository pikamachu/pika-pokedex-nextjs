import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { withTranslation } from '../../i18n';
import useCapture, { routeCapture } from '../../hooks/useCapture';

const PokemonCapture = ({ t, pokemon, size }) => {
  const [active, setActive] = useState(false);
  const { data: captures } = useCapture();

  const openCapturePage = (event) => {
    routeCapture(pokemon);
  };

  useEffect(() => {
    setActive(captures && captures.includes(pokemon.id));
  }, [captures]);

  return (
    <button
      type="button"
      title={t('capture-pokemon')}
      className={`pokemon-capture-button ${active ? 'active' : ''} ${size}`}
      onClick={openCapturePage}
    />
  );
};

PokemonCapture.propTypes = {
  pokemon: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
  }).isRequired,
  size: PropTypes.string,
};

PokemonCapture.defaultProps = {
  size: '',
};

export default withTranslation('pokemon')(PokemonCapture);
