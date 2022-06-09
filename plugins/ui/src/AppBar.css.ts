import { style } from "@vanilla-extract/css";
import { calc } from "@vanilla-extract/css-utils";
import { recipe } from "@vanilla-extract/recipes";
import { android, background, exitActive, vars } from "AppScreen.css";

import { f } from "./styles";

export const appBar = style([
  f.posAbs,
  f.flexAlignCenter,
  f.fullWidth,
  background,
  {
    height: vars.appBar.height,
    boxShadow: `inset 0px ${calc(vars.appBar.borderSize).negate()} 0 ${
      vars.appBar.borderColor
    }`,
    zIndex: vars.zIndexes.appBar,
    selectors: {
      [`${exitActive} > &`]: {
        transform: "translateX(100%)",
      },
    },
  },
]);

export const appBarLeft = style([
  f.flexAlignCenter,
  f.fullHeight,
  {
    padding: "0 0.5rem",
    ":empty": {
      display: "none",
    },
  },
]);

export const appBarBackButton = style([
  f.flexAlignCenter,
  f.flexJustifyCenter,
  f.cursorPointer,
  {
    color: "#000",
    opacity: 1,
    transition: "opacity 300ms",
    width: "2.25rem",
    height: "2.75rem",
    textDecoration: "none",
    outline: "none",
    ":active": {
      opacity: "0.2",
      transition: "opacity 0s",
    },
  },
]);

export const appBarCenter = style([
  f.flexAlignCenter,
  {
    flex: 1,
  },
]);

export const appBarCenterMain = recipe({
  base: {
    width: vars.appBar.center.mainWidth,
  },
  variants: {
    theme: {
      android: [
        f.fullWidth,
        {
          justifyContent: "flex-start",
          paddingLeft: "1rem",
          fontSize: "1.1875rem",
          lineHeight: "1.5",
          fontWeight: "bold",
          boxSizing: "border-box",
        },
      ],
      cupertino: [
        f.textAlignCenter,
        f.flexAlignCenter,
        f.flexJustifyCenter,
        f.posAbs,
        f.fullHeight,
        f.top0,
        {
          fontFamily: "-apple-system, BlinkMacSystemFont",
          fontWeight: 600,
          fontSize: "1rem",
          left: "50%",
          transform: "translate(-50%)",
        },
      ],
    },
  },
});

export const appBarCenterMainText = style([
  f.overflowHidden,
  f.whiteSpaceNowrap,
  f.fullWidth,
  {
    textOverflow: "ellipsis",
    fontSize: "inherit",
    fontWeight: "inherit",
  },
]);

export const appBarRight = style([
  f.flexAlignCenter,
  f.fullHeight,
  f.posRel,
  {
    padding: "0 0.5rem",
    marginLeft: "auto",
    ":empty": {
      display: "none",
    },
    selectors: {
      [`${android} > &`]: {
        padding: "0 0.5rem 0 0",
      },
    },
  },
]);
