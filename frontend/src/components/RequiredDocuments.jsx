function RequiredDocuments({ documents }) {
  const items = Array.isArray(documents) ? documents : [];

  return (
    <section className="details-card" aria-labelledby="documents-title">
      <div className="details-section-heading">
        <span className="details-section-icon" aria-hidden="true">▤</span>
        <div>
          <h2 id="documents-title">Required documents</h2>
          <p>Prepare these documents as part of your application.</p>
        </div>
      </div>
      {items.length > 0 ? (
        <ul className="document-list">
          {items.map((document) => (
            <li className="document-item" key={document.id ?? document.name}>
              <span className="document-check" aria-hidden="true">✓</span>
              <div className="document-copy">
                <div className="document-title-row">
                  <h3>{document.name}</h3>
                  <span
                    className={`document-badge ${
                      document.is_mandatory ? "mandatory" : "optional"
                    }`}
                  >
                    {document.is_mandatory ? "Mandatory" : "Optional"}
                  </span>
                </div>
                {document.description && <p>{document.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="documents-empty">
          No specific documents have been listed for this scholarship.
        </p>
      )}
    </section>
  );
}

export default RequiredDocuments;
