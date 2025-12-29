"use client";

import Link, { LinkProps } from "next/link";
import React from "react";

type Props = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const NextLinkRef = React.forwardRef<HTMLAnchorElement, Props>(
  function NextLinkRef({ href, ...props }, ref) {
    return <Link ref={ref} href={href} {...props} />;
  }
);

export default NextLinkRef;
