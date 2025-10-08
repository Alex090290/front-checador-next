"use client";

import { OverlayTrigger, Tooltip, TooltipProps } from "react-bootstrap";

function OverLay({
  children,
  string,
}: {
  children: React.ReactElement;
  string: string;
}) {
  const renderTooltip = (props: TooltipProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {string}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      {children}
    </OverlayTrigger>
  );
}

export default OverLay;
