export type ProfileAlbumItem = {
  id: string;
  imageUrl: string;
  caption: string;
  location: string;
  isDemo: boolean;
};

export type ProfileAlbum = {
  id: string;
  titleBn: string;
  titleEn: string;
  coverImageUrl: string;
  items: ProfileAlbumItem[];
  isDemo: boolean;
};

const demoItem = (id: string, caption: string, location: string): ProfileAlbumItem => ({ id, imageUrl: "community-pottery", caption, location, isDemo: true });

export const demoProfileAlbums: ProfileAlbum[] = [
  {
    id: "album-community-moments",
    titleBn: "কমিউনিটির মুহূর্ত",
    titleEn: "Community moments",
    coverImageUrl: "community-pottery",
    isDemo: true,
    items: [
      demoItem("album-community-1", "Making space for one another.", "Gazole, Malda"),
      demoItem("album-community-2", "A shared table, a shared story.", "Gazole, Malda"),
      demoItem("album-community-3", "Small moments from the neighbourhood.", "Gazole, Malda"),
      demoItem("album-community-4", "Together is the best place to begin.", "Gazole, Malda"),
      demoItem("album-community-5", "A calm afternoon with the community.", "Gazole, Malda"),
      demoItem("album-community-6", "People, places and useful work.", "Gazole, Malda"),
    ],
  },
  {
    id: "album-local-life",
    titleBn: "স্থানীয় জীবন",
    titleEn: "Local life",
    coverImageUrl: "community-pottery",
    isDemo: true,
    items: [
      demoItem("album-local-1", "A familiar corner of home.", "Gazole, Malda"),
      demoItem("album-local-2", "Local hands, local craft.", "Gazole, Malda"),
      demoItem("album-local-3", "A little colour in the everyday.", "Gazole, Malda"),
    ],
  },
];
