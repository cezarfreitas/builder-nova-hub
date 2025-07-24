export const CriticalCSS = () => {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        /* Critical styles para LCP */
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #000;
          color: #fff;
        }
        
        /* Hero section critical styles */
        .hero-section {
          min-height: 100vh;
          background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Button critical styles */
        .cta-button {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
          transform: scale(1.05);
        }
        
        /* Prevent layout shift */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Loading skeleton */
        .skeleton {
          background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `,
      }}
    />
  );
};
