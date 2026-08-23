export default function SiteFooter({ children }) {
  return (
    <footer>
      {children}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: children ? 20 : 0 }}>
        <img src="/icons/mark.png" alt="" width={20} height={20} style={{ borderRadius: 5 }} />
        <b>FixEasy</b>
      </div>
    </footer>
  );
}
