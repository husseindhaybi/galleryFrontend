import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'bi-facebook',
      url: 'https://www.facebook.com/share/1BmdEK3CnF/?mibextid=wwXIfr',
      hoverColor: '#1877f2'
    },
    {
      name: 'Instagram',
      icon: 'bi-instagram',
      url: 'https://www.instagram.com/gallery_dhaibi?igsh=cDZhcWs1dWpnd3pj',
      hoverColor: '#E4405F'
    }
  

  ];

  return (
    <footer className="bg-dark text-white mt-auto">
      
      <div className="container py-5">
        <div className="row g-4">
        
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-shop-window me-2 text-primary"></i>
              Gallery Dhaybi
            </h5>
            <p className="text-white-50 mb-3">
              Your trusted furniture store . 
              Quality furniture for every home.
            </p>
            <div className="d-flex gap-2">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center social-btn"
                  style={{ width: '42px', height: '42px' }}
                  aria-label={social.name}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = social.hoverColor;
                    e.currentTarget.style.borderColor = social.hoverColor;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className={`bi ${social.icon} fs-5`}></i>
                </a>
              ))}
            </div>
          </div>

        
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white-50 text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1"></i>
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-white-50 text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1"></i>
                  Products
                </Link>
              </li>
              <li className="mb-2">
                
              </li>
             
            </ul>
          </div>

          
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase">Customer Service</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/orders" className="text-white-50 text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1"></i>
                  Track Orders
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-white-50 text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1"></i>
                  My Account
                </Link>
              </li>

            </ul>
          </div>

        
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3 text-uppercase">Contact Info</h6>
            <ul className="list-unstyled text-white-50">
              <li className="mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                Minieh-Nabi-Youchaa
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2 text-primary"></i>
                <a href="tel:+961 3509827" className="text-white-50 text-decoration-none hover-link">
                  +961 3509827
                </a>
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope-fill me-2 text-primary"></i>
                <a href="mailto:husseindhaybi8@gmail.com" className="text-white-50 text-decoration-none hover-link">
                  husseindhaybi8@gmail.com
                </a>
              </li>
              <li className="mb-2">
                <i className="bi bi-clock-fill me-2 text-primary"></i>
                Mon - Sat: 9AM - 8PM
              </li>
            </ul>
          </div>
        </div>
      </div>

    
      <div className="border-top border-secondary py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
              <small className="text-white-50">
                &copy; {currentYear} Gallery Dhaybi - FurnitureSmart. All rights reserved.
              </small>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <small className="text-white-50 me-3">
                <a href="#privacy" className="text-white-50 text-decoration-none hover-link">
                  Privacy Policy
                </a>
              </small>
              <small className="text-white-50 me-3">
                <a href="#terms" className="text-white-50 text-decoration-none hover-link">
                  Terms of Service
                </a>
              </small>
              <small className="text-white-50">
                <a href="#cookies" className="text-white-50 text-decoration-none hover-link">
                  Cookie Policy
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .social-btn {
          transition: all 0.3s ease;
        }
        
        .hover-link {
          transition: color 0.2s ease;
        }
        
        .hover-link:hover {
          color: #fff !important;
          padding-left: 5px;
        }
      `}</style>
    </footer>
  );
};

export default Footer;