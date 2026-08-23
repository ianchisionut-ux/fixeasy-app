export default function SkeletonProviderCard() {
  return (
    <div className="prov-card" style={{ pointerEvents: "none" }}>
      <div className="prov-top">
        <div className="prov-head">
          <div className="skeleton-line" style={{ width: 48, height: 48, borderRadius: 12 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ width: "70%", height: 15, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: "45%", height: 12 }} />
          </div>
        </div>
        <div className="skeleton-line" style={{ width: "50%", height: 13, marginTop: 12 }} />
        <div style={{ display: "flex", gap: 6, margin: "14px 0" }}>
          <div className="skeleton-line" style={{ width: 70, height: 22, borderRadius: 999 }} />
          <div className="skeleton-line" style={{ width: 90, height: 22, borderRadius: 999 }} />
        </div>
      </div>
      <div className="prov-bottom">
        <div className="skeleton-line" style={{ width: 60, height: 16 }} />
        <div className="skeleton-line" style={{ width: 100, height: 36, borderRadius: 999 }} />
      </div>
    </div>
  );
}
