import { useState } from "react";
import "./Button.css";

interface Props {
  content: string;
  className?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  backgroundColor?: string;
  background?: string;
  padding?: string;
  margin?: string;
  position?:
    | "absolute"
    | "relative"
    | "fixed"
    | "static"
    | "sticky"
    | "inherit"
    | "initial"
    | "unset";
  centerInPage?: boolean;
  top?: string;
  left?: string;
  fontStyle?: string;
  onClickAction?: string;
  transition?: string;
  onClick?: () => void;
}

const Button = ({
  content,
  className,
  width,
  height,
  fontSize,
  backgroundColor,
  background,
  padding,
  margin,
  position,
  centerInPage,
  top,
  left,
  fontStyle,
  onClickAction,
  transition,
  onClick,
}: Props) => {
  const [visible, setVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if ((onClickAction ?? "").includes("hide")) {
      setVisible(false);
    }

    if (onClick) {
      onClick();
    }
  };

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <button
        className={className}
        style={{
          width: width,
          height: height,

          backgroundColor: backgroundColor,
          background: background,
          fontSize: fontSize,
          padding: padding,
          margin: margin,
          top: centerInPage ? "50%" : top,
          left: centerInPage ? "50%" : left,
          position: position,
          fontStyle: fontStyle,
          transform: centerInPage
            ? "translate(-50%, -50%) scale(" +
              (isActive ? 0.95 : isHovered ? 1.02 : 1) +
              ")"
            : "scale(" + (isActive ? 0.95 : isHovered ? 1.02 : 1) + ")",
          transition: transition,
        }}
        onClick={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {content}
      </button>
    </div>
  );
};

export default Button;
