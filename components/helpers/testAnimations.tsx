export default function TestAnimationComponent() {
  return (
    <div
      className="card p-4 border-0"
      style={{ maxWidth: "380px", width: "100%", margin: "0 auto" }}
    >
      <div className="d-flex align-items-center placeholder-glow">
        <div
          className="rounded-circle bg-secondary placeholder"
          style={{ width: "40px", height: "40px", flexShrink: 0 }}
        />

        <div className="ms-3 w-100">
          <span className="placeholder col-7 bg-secondary rounded mb-2 d-block" />

          <div className="row g-2">
            <span className="placeholder col-8 bg-secondary rounded" />
            <span className="placeholder col-4 bg-secondary rounded" />
            {/* <span className="placeholder col-12 bg-secondary rounded mt-1" /> */}
          </div>
        </div>
      </div>
    </div>
  );
}