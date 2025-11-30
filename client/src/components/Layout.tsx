import FooterNav from "./FooterNav";

export default function Layout({ children, disablePadding }) {
  return (
    <div className={disablePadding ? "" : "page-with-footer"}>
      {children}
      <FooterNav />
    </div>
  );
}
