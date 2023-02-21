import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { getActiveProperties } from "./properties/active";
import { getBaseProperties } from "./properties/base";
import { getHoverProperties } from "./properties/hover";

const BUTTON_HEIGHTS = {
  m: "50px",
  s: "30px",
};

const BUTTON_ORIENTATION = {
  left: "flex-start",
  right: "flex-end",
  center: "center",
};

const Container = (
  type,
  disabled,
  hover,
  borderRadius,
  baseColorProperties,
  activeProperties,
  rounded,
  size
) => {
  return styled(Box)(
    ({ theme }) => `
    background:${baseColorProperties.backgroundColor};
    border:${baseColorProperties.border};
    width:${
      rounded
        ? BUTTON_HEIGHTS[size]
        : type === "filled"
        ? "100%"
        : "max-content"
    };
    height:${BUTTON_HEIGHTS[size]};
    border-radius:${borderRadius ?? `${theme.shape.borderRadius}px`};
    cursor:pointer;
    position:relative;
    overflow:hidden;
    opacity:${disabled ? "0.5" : "1"};
    pointer-events:none;
    box-sizing:border-box;
    & .MuiTypography-root,& .MuiIcon-root,& svg path	{
      color:${baseColorProperties.color} !important;
      fill:${baseColorProperties.color} !important;
    }
    & .MuiCircularProgress-circle	{
      color:${baseColorProperties.color} !important;
    }
    &:hover .MuiTypography-root,&:hover .MuiIcon-root,&:hover svg path	{
      color:${hover.color} !important;
      fill:${hover.color} !important;
    }
    &:active .MuiTypography-root,&:active .MuiIcon-root,&:active svg path	{
      color:${activeProperties.color} !important;
      fill:${activeProperties.color} !important;
    }
    &:hover{
        border:${hover.border} !important;
        transition: all 0.2s;
    }
    &:active{
      border:${activeProperties.border} !important;
      transition: all 0.2s;
    }
`
  );
};

const ButtonRipple = styled(Box)();

const CustomRippleBg = (disabled, hover, activeProperties, borderRadius) => {
  return styled(Box)(
    ({ theme }) => `
    position:absolute;
    left:50%;
    top:0%;
    transform:translate(-50%);
    pointer-events:${disabled ? "none" : "auto"};
    width:100%;
    height:100%;
    box-sizing:border-box;
    border-radius:${borderRadius ?? `${theme.shape.borderRadius}px`};
    overflow:hidden;
    & ${ButtonRipple}{
      position:absolute;
      left:50%;
      top:40%;
      transform: scale(0) translate(-50%,-5px);
      width:10px;
      height:10px;
      box-sizing:border-box;
      border-radius:${borderRadius ?? `${theme.shape.borderRadius}px`};
      transform-origin:0 0;
    }
    &:hover ~ .MuiTypography-root,&:hover ~ .MuiIcon-root,&:hover ~ svg path	{
        color:${hover.color ? hover.color : "initial"} !important;
        fill:${hover.color ? hover.color : "initial"} !important;
    }
    &:hover ${ButtonRipple}{
      opacity:${disabled ? 0 : 1};
      transform: scale(100) translate(-50%,-5px);
      transition:opacity 1s,transform 1s;
      background-color:${hover.backgroundColor};
    }
    &:active ${ButtonRipple}{
      background-color:${activeProperties.backgroundColor} !important;
      opacity:${disabled ? 0 : 1};
      transform: scale(100) translate(-50%,-5px);
      transition:opacity 1s,transform 1s;
    }
`
  );
};

export const Button = ({
  type = "hugged",
  size = "m",
  text = "",
  StartIcon = null,
  EndIcon = null,
  variant = "primary",
  disabled = false,
  showLoader = false,
  borderRadius = undefined,
  onClickFn = () => null,
  web3Button = false,
  orientation = "center",
  columnGap = "",
  textVariant = "body-m-bold",
  rounded = false,
  padding = undefined,
  disconnectedText = "Wallet Disconnected",
  ...props
}) => {
  const theme = useTheme();

  const hoverProperties = getHoverProperties(theme)[variant];

  const baseColorProperties = getBaseProperties(theme)[variant];

  const activeProperties = getActiveProperties(theme)[variant];

  const NewContainer = Container(
    type,
    disabled,
    hoverProperties,
    borderRadius,
    baseColorProperties,
    activeProperties,
    rounded,
    size
  );

  const RippleContainer = CustomRippleBg(
    disabled,
    hoverProperties,
    activeProperties,
    borderRadius
  );

  return (
    <NewContainer height={BUTTON_HEIGHTS[size]} {...props}>
      <RippleContainer onClick={onClickFn} width="100%" height="100%">
        <ButtonRipple />
      </RippleContainer>
      <Box sx={{ pointerEvents: "unset", position: "relative" }}>
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          height={BUTTON_HEIGHTS[size]}
          justifyContent={BUTTON_ORIENTATION[orientation]}
          columnGap={columnGap}
          marginTop="-2px">
          {!showLoader ? (
            <>
              {StartIcon}
              <Typography paddingY="0" variant={textVariant}>
                {text}
              </Typography>
              {EndIcon}
            </>
          ) : (
            <CircularProgress size={size === "m" ? "20px" : "15px"} />
          )}
        </Box>
      </Box>
    </NewContainer>
  );
};
