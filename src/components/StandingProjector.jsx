import standingProjectorOff from "../assets/icons/projector_off.png";
import standingProjectorOn from "../assets/icons/projector_on.png";
import mobileProjectorOff from "../assets/icons/projector_mobile_off.png";
import mobileProjectorOn from "../assets/icons/projector_mobile_on.png";
import "./StandingProjector.css";

function StandingProjector({ artwork, phase, className = "" }) {
  const isOn = phase === "on";

  return (
    <div className={`standing-projector${className ? ` ${className}` : ""}`}>
      <img
        className="standing-projector__image"
        src={isOn ? standingProjectorOn : standingProjectorOff}
        alt={isOn ? "Projector on" : "Projector off"}
      />
      {phase === "inserting" && artwork && (
        <div className="standing-projector__artwork" aria-hidden="true">
          <img src={artwork.image} alt="" />
        </div>
      )}
    </div>
  );
}

export function MobileProjector({ artwork, phase, className = "" }) {
  const isOn = phase === "on";

  return (
    <div className={`mobile-projector${isOn ? " mobile-projector--on" : ""}${className ? ` ${className}` : ""}`}>
      <img
        className="mobile-projector__image"
        src={isOn ? mobileProjectorOn : mobileProjectorOff}
        alt={isOn ? "Projector on" : "Projector off"}
      />
      {phase === "inserting" && artwork && (
        <div className="mobile-projector__artwork" aria-hidden="true">
          <img src={artwork.image} alt="" />
        </div>
      )}
    </div>
  );
}

export default StandingProjector;
