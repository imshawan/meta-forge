
type Tool = "assets" | "metadata";

type IconSize = 16 | 32 | 48 | 64 | 96 | 128 | 180 | 192 | 256 | 384 | 512;

interface MetadataFormState {
  appName: string;
  baseUrl: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  authorName: string;
  twitterHandle: string;
}

interface GeneratedIcon {
  size: IconSize;
  url: string; // data URL
}