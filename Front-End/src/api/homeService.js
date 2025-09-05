// /src/api/homeService.js
// Shapes we aim for:
//
// HomeData = {
//   banners: [{ id, imageUrl? }],                      // imageUrl optional (we show gray if missing)
//   sections: [                                        // admin-defined sections
//     {
//       id, title,                                     // e.g. "Games", "Entertainments", ...
//       items: [                                       // products under the section
//         { id, title, imageUrl?, price?, currency? }
//       ]
//     }
//   ]
// }

export async function getHomeData() {
  // TODO: Replace with your fetch(...) to your backend
  // Example: const res = await fetch(BASE_URL + "/home"); return await res.json();
  await sleep(450); // simulate network

  return {
    banners: [{ id: "b1" }, { id: "b2" }, { id: "b3" }], // no images yet => gray blocks
    sections: [
      {
        id: "s1",
        title: "Games",
        items: [
          { id: "g1", title: "Game 1" },
          { id: "g2", title: "Game 2" },
          { id: "g3", title: "Game 3" },
        ],
      },
      {
        id: "s2",
        title: "Entertainments",
        items: [
          { id: "e1", title: "Movie Cards" },
          { id: "e2", title: "Music Cards" },
        ],
      },
      {
        id: "s3",
        title: "Live Apps",
        items: [
          { id: "a1", title: "App 1" },
          { id: "a2", title: "App 2" },
        ],
      },
    ],
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
