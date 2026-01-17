import { useState } from 'react';
import { FaMagic, FaSpinner } from 'react-icons/fa';
import { aiService } from '../services/api';

const StyleTransformer = ({ product }) => {
    const [selectedStyle, setSelectedStyle] = useState('');
    const [transformedImage, setTransformedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const styles = [
        { id: 'modern', name: 'Modern', emoji: '🏢', description: 'Clean lines & minimalist' },
        { id: 'vintage', name: 'Vintage', emoji: '🕰️', description: 'Classic retro charm' },
        { id: 'industrial', name: 'Industrial', emoji: '🏭', description: 'Raw metal & urban' },
        { id: 'scandinavian', name: 'Scandinavian', emoji: '🌲', description: 'Nordic minimalism' },
        { id: 'rustic', name: 'Rustic', emoji: '🪵', description: 'Warm farmhouse' },
        { id: 'mid-century', name: 'Mid-Century', emoji: '🎨', description: 'Retro curves' },
        { id: 'bohemian', name: 'Bohemian', emoji: '🌺', description: 'Eclectic & artistic' },
        { id: 'luxury', name: 'Luxury', emoji: '👑', description: 'Elegant & sophisticated' }
    ];

    const handleTransform = async () => {
        if (!selectedStyle) {
            setError('Please select a style first!');
            return;
        }

        setLoading(true);
        setError(null);
        setTransformedImage(null);

        try {
            const response = await aiService.transformStyle(product.product_id, selectedStyle);
            
            if (response.success) {
                setTransformedImage(response.transformed_image);
            } else {
                setError(response.error || 'Transformation failed');
            }
        } catch (err) {
            console.error('Transform error:', err);
            setError(err.response?.data?.error || 'Failed to transform style');
        } finally {
            setLoading(false);
        }
    };

    const fixImagePath = (imagePath) => {
        if (!imagePath) return '/placeholder.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads')) return `${imagePath}`;
        return `/uploads/${imagePath}`;
    };

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '24px'
        }}>
           
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FaMagic style={{ color: '#8b5cf6' }} />
                    AI Style Transformer
                </h3>
                <p style={{ color: '#718096', fontSize: '14px' }}>
                    See how this furniture would look in different styles using AI
                </p>
            </div>

      
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#4a5568',
                    marginBottom: '12px'
                }}>
                    Choose a Style:
                </label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px'
                }}>
                    {styles.map(style => (
                        <button
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            style={{
                                padding: '12px',
                                border: selectedStyle === style.id ? '2px solid #8b5cf6' : '2px solid #e2e8f0',
                                borderRadius: '8px',
                                backgroundColor: selectedStyle === style.id ? '#f3e8ff' : '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedStyle !== style.id) {
                                    e.currentTarget.style.borderColor = '#cbd5e0';
                                    e.currentTarget.style.backgroundColor = '#f7fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedStyle !== style.id) {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.backgroundColor = '#fff';
                                }
                            }}
                        >
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{style.emoji}</div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#2d3748',
                                marginBottom: '2px'
                            }}>
                                {style.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#718096' }}>
                                {style.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

         
            <button
                onClick={handleTransform}
                disabled={loading || !selectedStyle}
                style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: loading || !selectedStyle ? '#cbd5e0' : '#8b5cf6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading || !selectedStyle ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                    if (!loading && selectedStyle) {
                        e.currentTarget.style.backgroundColor = '#7c3aed';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!loading && selectedStyle) {
                        e.currentTarget.style.backgroundColor = '#8b5cf6';
                    }
                }}
            >
                {loading ? (
                    <>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                        Transforming with AI...
                    </>
                ) : (
                    <>
                        <FaMagic />
                        Transform Style
                    </>
                )}
            </button>

            {error && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#fed7d7',
                    border: '1px solid #fc8181',
                    borderRadius: '8px',
                    color: '#c53030',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            {transformedImage && (
                <div style={{ marginTop: '24px' }}>
                    <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#2d3748',
                        marginBottom: '16px'
                    }}>
                        ✨ Transformation Result
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px'
                    }}>
                       
                        <div>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#4a5568',
                                marginBottom: '8px'
                            }}>
                                Original
                            </p>
                            <img
                                src={fixImagePath(product.image_url || product.imageUrl || product.image)}
                                alt="Original"
                                style={{
                                    width: '100%',
                                    height: '300px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '2px solid #e2e8f0'
                                }}
                            />
                        </div>
                     
                        <div>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#8b5cf6',
                                marginBottom: '8px'
                            }}>
                                {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style
                            </p>
                            <img
                                src={transformedImage}
                                alt="Transformed"
                                style={{
                                    width: '100%',
                                    height: '300px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '2px solid #8b5cf6'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

        
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default StyleTransformer;