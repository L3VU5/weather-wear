import React from "react";
import icons from "../constants/icons";

interface IconInterface {
  size?: number;
  icon: string;
}

const Icon = ({ size = 24, icon = "" }: IconInterface): JSX.Element => (
  <svg
    className="h-6 w-6 inline-block fill-current outline-0 align-middle"
    viewBox={`0 0 ${size} ${size}`}
  >
    <path d={icons[icon]} />
  </svg>
);

export default Icon;
