import { Box, keyframes, styled } from "@mui/material";

export const animateDown = keyframes`
from {
  transform: translateY(-1000px);
}
to {
  transform: translateY(0px);
}
`;

export const SlideDownContainer = styled(Box)(
  () => `
        background: linear-gradient(106.5deg, rgba(24, 47, 68, 0.75) -10.36%, rgba(41, 68, 96, 0.45) 102.62%);
        backdrop-filter: blur(16px);
        display:flex;
        flex-direction:column;
        align-items:center;
        overflow-y:hidden;
        padding-left:0.5rem;
        padding-right:0.5rem;
        top:0;
        left:0;
        width:100%;
        position:fixed;
        padding-top:0.5rem;
        max-height:100vh;
        & *::-webkit-scrollbar {
          display: none;
        }
  
        & *{
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;
        }
        padding-bottom:1rem;
        padding-top:1rem;
    `
);
