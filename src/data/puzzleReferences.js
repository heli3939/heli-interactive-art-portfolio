import albumCover1 from "../assets/artworks/illust/puzzle/albums/1_400px.jpg";
import albumCover2 from "../assets/artworks/illust/puzzle/albums/2_400px.jpg";
import albumCover3 from "../assets/artworks/illust/puzzle/albums/3_400px.jpg";
import albumCover4 from "../assets/artworks/illust/puzzle/albums/4_400px.jpg";
import albumCover5 from "../assets/artworks/illust/puzzle/albums/5_400px.jpg";
import albumCover6 from "../assets/artworks/illust/puzzle/albums/6_400px.jpg";
import albumCover7 from "../assets/artworks/illust/puzzle/albums/7_400px.jpg";
import albumCover8 from "../assets/artworks/illust/puzzle/albums/8_400px.jpg";
import albumCover9 from "../assets/artworks/illust/puzzle/albums/9_400px.jpg";

// Replace these fallback records with the final album credits, cover files, and
// YouTube Music URLs when they are supplied. Keeping them here makes the
// completed-puzzle UI entirely data-driven.
const puzzleReferences = [
  {
    id: 1,
    albumTitle: "What does it mean to die",
    artist: "Iori Kanzaki",
    albumCover: albumCover1,
    musicUrl: "https://music.youtube.com/playlist?list=PLnRfp4f4lw2CfHnmWMjCzoWiUuVj3Whfc&si=ujodmAxA2rhi9yNQ",
    description: "An emotionally raw, lyric-heavy Vocaloid album that turns fear of death, loneliness and the question of how to keep living into music. In my illustration, I used wings, glitch effects, muted textures and grid-like frames to reflect its dark, fragmented aesthetic.",
    position: "top-left",
  },
  {
    id: 2,
    albumTitle: "End of the World",
    artist: "Chouchou-P",
    albumCover: albumCover2,
    musicUrl: "https://music.apple.com/jp/album/end-of-the-world-feat-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF/980246426?l=en-US",
    description: "A dramatic Vocaloid piano-rock album, mixing beautiful piano melodies with powerful rock arrangements and emotional, often bittersweet songwriting. In my illustration, I drew inspiration from the cover itself, incorporate visual elements like butterfly, shooting star, telescope from its cover art.",
    position: "below-piece-2",
  },
  {
    id: 3,
    albumTitle: "The First Symbol System",
    artist: "Shannon",
    albumCover: albumCover3,
    musicUrl: "https://open.spotify.com/album/4XzJFlDxKdMGbrVdSnhWIQ?si=JM5F78MeRu2D-Z7squx3nA",
    description: "A surreal Vocaloid album where music, illustration, and animation build an unfamiliar world filled with death, creatures, lost civilizations, and mysterious symbols. In my illustration, I incorporated visual elements from MVs of album tracks, such as dinosaur skeletons, telegraph poles, and bubbles.",
    position: "top-right",
  },
  {
    id: 4,
    albumTitle: "NeoDreamTraveler",
    artist: "harumakigohan",
    albumCover: albumCover4,
    musicUrl: "https://open.spotify.com/album/5G5D0OSg5puTVZMg4nVocH?si=Tn78J35lQpG_4kbVPI68BA",
    description: "A dreamy, melancholic Vocaloid album centered on the theme of dreams, blending soft, emotional electronic melodies with layered synth textures and delicate vocal tuning to create a drifting, surreal atmosphere. In my illustration, I incorporated the album cover’s blue-pink color palette along with elements such as clouds, fireworks, and the moon.",
    position: "left",
  },
  {
    id: 5,
    albumTitle: "Supercell",
    artist: "ryo (Supercell)",
    albumCover: albumCover5,
    musicUrl: "https://music.apple.com/us/album/supercell-feat-hatsune-miku/440374074",
    description: "A hugely influential early Hatsune Miku album full of catchy pop-rock melodies and emotionally direct songs that helped define the sound of early online Vocaloid culture. As the central image, I incorporated elements from its well-known tracks, such as rainbow-coloured keys, a black-cyan megaphone, and tears, to reference songs on the album.",
    position: "below-piece-5",
  },
  {
    id: 6,
    albumTitle: "Summer without you",
    artist: "*Luna",
    albumCover: albumCover6,
    musicUrl: "https://open.spotify.com/album/198KI39Z11DRHFoFqbkYb2?si=hHJgT5JGQHKQD8RWjTT0zw",
    description: "A bright yet wistful Vocaloid pop album capturing the many shades of summer—festivals, memories, farewells, and the feeling of a season slipping away too quickly. I incorporated elements from its cover, such as a torii gate, clouds, and reflections on the water’s surface.",
    position: "right",
  },
  {
    id: 7,
    albumTitle: "Flowers and Syrup, the Final Train",
    artist: "n-buna",
    albumCover: albumCover7,
    musicUrl: "https://open.spotify.com/album/5fgdRwwC6kohkB1WMT8QMR?si=tTECiiDSRpmaH_s-S6wsfw",
    description: "A melancholic, guitar-led Vocaloid album that feels like travelling through the end of summer, filled with vivid scenery, memories and a sense of things coming to an end. It’s my favourite album, so I referenced both the cover, like the fireworks and train railings, and visuals from the songs, including night skies, lanterns, sunflowers, road signs and crayon-style backgrounds.",
    position: "bottom-left",
  },
  {
    id: 8,
    albumTitle: "Unhappy Refrain",
    artist: "wowaka",
    albumCover: albumCover8,
    musicUrl: "https://music.youtube.com/playlist?list=PLX83LnszEUuk0QfeT_RCHVoN1FaiD4F8J&si=mAiSoO2s5CuU6J2f",
    description: "A relentless, high-energy Vocaloid rock album packed with rapid melodies, dense rhythms and Miku’s distinctive fast vocals, carrying an anxious and emotionally restless intensity. In my illustration, I referenced wowaka’s signature visual style through bold lines, geometric shapes and minimalism, as well as the characters’ costume designs from the songs in the game.",
    position: "above-piece-8",
  },
  {
    id: 9,
    albumTitle: "Nostalgia",
    artist: "doriko",
    albumCover: albumCover9,
    musicUrl: "https://music.apple.com/jp/album/nostalgia/908693953",
    description: "A story-focused Miku concept album, almost like a collection of period short stories, with a nostalgic, romantic and slightly theatrical atmosphere. In my illustration, I referenced elements from its cover art, such as the clock, compass, star trails and paper plane, and used a monochrome style to echo its visual mood.",
    position: "bottom-right",
  },
];

export default puzzleReferences;
