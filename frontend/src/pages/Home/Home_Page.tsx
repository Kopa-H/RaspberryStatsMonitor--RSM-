import Button from "../../components/Button/Button";
import StatsMonitor from "../../components/StatsMonitor/StatsMonitor";

import "./styles.css";

function HomePage() {
  return (
    <div className="home-page">
      <Button
        className="button main-title-button"
        content="Raspberry Stats Monitor"
        onClick={() => window.location.reload()}
      ></Button>
      <StatsMonitor />
    </div>
  );
}

export default HomePage;
