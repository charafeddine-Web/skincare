import{j as e}from"./index-DBq7Y1bO.js";import{L as i}from"./loader-circle-CIOpUK1n.js";const o=({message:t="Récupération des données en cours..."})=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 20px",color:"var(--text-light)",minHeight:"50vh"},children:[e.jsx("style",{children:`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}),e.jsx("div",{style:{background:"var(--white)",padding:"20px",borderRadius:"50%",marginBottom:"24px",boxShadow:"0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--divider)"},children:e.jsx(i,{size:38,color:"var(--accent-deep)",style:{animation:"spin 1.2s linear infinite"}})}),e.jsx("h3",{style:{fontSize:"1.2rem",fontWeight:600,color:"var(--text-main)",marginBottom:"10px",animation:"pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"},children:"Un instant..."}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-muted)"},children:t})]});export{o as A};
