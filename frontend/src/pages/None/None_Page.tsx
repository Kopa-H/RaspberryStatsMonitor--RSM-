import "./styles.css";

function NonePage() {
  return (
    <div className="none-page">
      <button
        className="return-home-button"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Error 404: Not found Redirect home!
      </button>
    </div>
  );
}

export default NonePage;
