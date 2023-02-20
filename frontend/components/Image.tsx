import { Box } from "@mui/material";
import { cloudinaryLoader } from "functions/cloudinary";
import { uriToHttp } from "functions/convert/uriToHttp";
import NextImage from "next/image";

export type ImageProps = {
  src: string;
  width: number;
  height: number;
  onError?: (e: any) => void;
  alt?: string;
};

const Image = ({ src, width, height, onError, alt, ...rest }: ImageProps) => {
  /* Only remote images get routed to Cloudinary */
  const loader =
    typeof src === "string" && src.includes("http")
      ? cloudinaryLoader
      : undefined;
  return (
    <Box sx={{ width, height }} overflow="hidden" borderRadius="100%">
      <NextImage
        onError={onError}
        placeholder="empty"
        loader={loader}
        src={uriToHttp(src)[0] ?? ""}
        width={width}
        height={height}
        alt={alt ?? "Alt Text"}
        {...rest}
      />
    </Box>
  );
};

export default Image;
