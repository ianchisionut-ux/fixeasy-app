import Image from "next/image";

export default function SiteFooter({ children }) {
  return (
    <footer>
      {children}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: children ? 20 : 0 }}>
        <Image src="/icons/mark.png" alt="" width={111} height={111} style={{ width: 20, height: 20, borderRadius: 5 }} />
        <b>FixEasy</b>
      </div>
    </footer>
  );
}
