export interface ParsedLensPost {
  publicationUrl: string;
}

export interface ParsedCast {
  text: string;
  timestamp: Date;
  address: string;
  hash: string;
  username: string;
  ogpImage: string;
  images: string[];
}
