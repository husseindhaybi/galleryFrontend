import { FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import './FloatingButtons.css';

const FloatingButtons = () => {
  const phoneNumber = '9613509827';
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const mapsLink = 'https://maps.app.goo.gl/MjVzgjypouREWn42A';

  return (
    <div className="floating-buttons">
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="floating-btn whatsapp-btn" title="Contact us on WhatsApp">
        <FaWhatsapp size={28} />
      </a>
      <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="floating-btn maps-btn" title="Find us on Google Maps">
        <FaMapMarkerAlt size={28} />
      </a>
    </div>
  );
};

export default FloatingButtons;