export default function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div className="page-head-left"><h1>{title}</h1><p>{sub}</p></div>
      {children}
    </div>
  );
}
