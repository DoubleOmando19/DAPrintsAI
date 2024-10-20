export function getProduct(productId) {
  let matchingProduct;

  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });

  return matchingProduct;
}


export const products = [
  {
    "id": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    "image": "images/products/FallForestTrail.png",
    "image1": "/images/New Project picz PDF/FallTrail.pdf",
    "name": "AI Artwork - Fall Trail",
    "rating": {
      "stars": 4.5,
      "count": 87
    },
    "priceCents": 100
  },
  {
    "id": "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    "image": "images/products/Theship.png",
    "image1": "/images/New Project picz PDF/Theship.pdf",
    "name": "AI Artwork - The Ship",
    "rating": {
      "stars": 4,
      "count": 127
    },
    "priceCents": 299

  },
  {
    "id": "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
    "image": "images/products/HorseRace.png",
    "image1": "/images/New Project picz PDF/HorseRace.pdf",
    "name": "AI Artwork - Horse Race",
    "rating": {
      "stars": 4.5,
      "count": 56
    },
    "priceCents": 299
  },
  {
    "id": "54e0eccd-8f36-462b-b68a-8182611d9add",
    "image": "images/products/2Birds.png",
    "image1": "/images/New Project picz PDF/2Birds.pdf",
    "name": "AI Artwork - Two Birds",
    "rating": {
      "stars": 5,
      "count": 2197
    },
    "priceCents": 299

  },
  {
    "id": "3ebe75dc-64d2-4137-8860-1f5a963e534b",
    "image": "images/products/flowers.png",
    "image1": "/images/New Project picz PDF/Flowers.pdf",
    "name": "AI Artwork - Flowers",
    "rating": {
      "stars": 4,
      "count": 37
    },
    "priceCents": 299
  },
  {
    "id": "8c9c52b5-5a19-4bcb-a5d1-158a74287c53",
    "image": "images/products/Planetfinger.png",
    "image1": "/images/New Project picz PDF/Planetonhand.pdf",
    "name": "AI Artwork - Planet on hand",
    "rating": {
      "stars": 4.5,
      "count": 175
    },
    "priceCents": 299
  },
  {
    "id": "dd82ca78-a18b-4e2a-9250-31e67412f98d",
    "image": "images/products/Jungletrails.png",
    "image1": "/images/New Project picz PDF/Jungletrails.pdf",
    "name": "AI Artwork - Jungle trails",
    "rating": {
      "stars": 4.5,
      "count": 317
    },
    "priceCents": 299

  },
  {
    "id": "77919bbe-0e56-475b-adde-4f24dfed3a04",
    "image": "images/products/Shark.png",
    "image1": "/images/New Project picz PDF/Shark.pdf",
    "name": "AI Artwork - The Shark",
    "rating": {
      "stars": 4.5,
      "count": 144
    },
    "priceCents": 299
  },
  {
    "id": "3fdfe8d6-9a15-4979-b459-585b0d0545b9",
    "image": "images/products/Tiger.png",
    "image1": "/images/New Project picz PDF/Tiger.pdf",
    "name": "AI Artwork - Tiger",
    "rating": {
      "stars": 4.5,
      "count": 305
    },
    "priceCents": 299
  },
  {
    "id": "58b4fc92-e98c-42aa-8c55-b6b79996769a",
    "image": "images/products/Greenfield.png",
    "image1": "/images/New Project picz PDF/Greenfield.pdf",
    "name": "AI Artwork - Greenfield",
    "rating": {
      "stars": 4,
      "count": 89
    },
    "priceCents": 299
  },
  {
    "id": "5968897c-4d27-4872-89f6-5bcb052746d7",
    "image": "images/products/Abstractmulti.png",
    "image1": "/images/New Project picz PDF/Abstractmulti.pdf",
    "name": "AI Artwork - Abstractmulti",
    "rating": {
      "stars": 4.5,
      "count": 235
    },
    "priceCents": 299
  },
  {
    "id": "aad29d11-ea98-41ee-9285-b916638cac4a",
    "image": "images/products/Polarbear.png",
    "image1": "/images/New Project picz PDF/Polarbear.pdf",
    "name": "AI Artwork - Polarbear",
    "rating": {
      "stars": 4.5,
      "count": 30
    },
    "priceCents": 299

  },
  {
    "id": "04701903-bc79-49c6-bc11-1af7e3651358",
    "image": "images/products/Aquabeach.png",
    "image1": "/images/New Project picz PDF/Aquabeach.pdf",
    "name": "AI Artwork - Aquabeach",
    "rating": {
      "stars": 4.5,
      "count": 562
    },
    "priceCents": 299

  },
  {
    "id": "901eb2ca-386d-432e-82f0-6fb1ee7bf969",
    "image": "images/products/Shelfwhite.png",
    "image1": "/images/New Project picz PDF/Shelfwhite.pdf",
    "name": "AI Artwork - Shelf white",
    "rating": {
      "stars": 4.5,
      "count": 232
    },
    "priceCents": 299

  },
  {
    "id": "82bb68d7-ebc9-476a-989c-c78a40ee5cd9",
    "image": "images/products/Tigercharge.png",
    "image1": "/images/New Project picz PDF/Tigercharge.pdf",
    "name": "AI Artwork - Tiger charge",
    "rating": {
      "stars": 4,
      "count": 160
    },
    "priceCents": 299

  },
  {
    "id": "c2a82c5e-aff4-435f-9975-517cfaba2ece",
    "image": "images/products/Designer.png",
    "image1": "/images/New Project picz PDF/Designer.pdf",
    "name": "AI Artwork - Shelf Design",
    "rating": {
      "stars": 5,
      "count": 846
    },
    "priceCents": 299

  },
  {
    "id": "6b07d4e7-f540-454e-8a1e-363f25dbae7d",
    "image": "images/products/Abstractgreen.png",
    "image1": "/images/New Project picz PDF/Abstractgreen.pdf",
    "name": "AI Artwork - Abstractgreen",
    "rating": {
      "stars": 4,
      "count": 99
    },
    "priceCents": 299

  },
  {
    "id": "a82c6bac-3067-4e68-a5ba-d827ac0be010",
    "image": "images/products/Sunset.png",
    "image1": "/images/New Project picz PDF/Sunset.pdf",
    "name": "AI Artwork - Sunset",
    "rating": {
      "stars": 4,
      "count": 215
    },
    "priceCents": 299

  },
  {
    "id": "e4f64a65-1377-42bc-89a5-e572d19252e2",
    "image": "images/products/Deesigner.png",
    "image1": "/images/New Project picz PDF/Deesigner.pdf",
    "name": "AI Artwork - Deesigner",
    "rating": {
      "stars": 4.5,
      "count": 52
    },
    "priceCents": 299
  },
  {
    "id": "b0f17cc5-8b40-4ca5-9142-b61fe3d98c85",
    "image": "images/products/Underthetree.png",
    "image1": "/images/New Project picz PDF/Underthetree.pdf",
    "name": "AI Artwork - Under the tree",
    "rating": {
      "stars": 4.5,
      "count": 2465
    },
    "priceCents": 299

  },
  {
    "id": "a93a101d-79ef-4cf3-a6cf-6dbe532a1b4a",
    "image": "images/products/Cyclist.png",
    "image1": "/images/New Project picz PDF/Cyclist.pdf",
    "name": "AI Artwork - Cyclist",
    "rating": {
      "stars": 4.5,
      "count": 119
    },
    "priceCents": 299
  },
  {
    "id": "4f4fbcc2-4e72-45cc-935c-9e13d79cc57f",
    "image": "images/products/Redflowerfield.png",
    "image1": "/images/New Project picz PDF/Redflowerfield.pdf",
    "name": "AI Artwork - Red Flower Field",
    "rating": {
      "stars": 4,
      "count": 326
    },
    "priceCents": 299
  },
  {
    "id": "8b5a2ee1-6055-422a-a666-b34ba28b76d4",
    "image": "images/products/Boatwaterfront.png",
    "image1": "/images/New Project picz PDF/Boatwaterfront.pdf",
    "name": "AI Artwork - Boat Water Front",
    "rating": {
      "stars": 4.5,
      "count": 2556
    },
    "priceCents": 299
  },
  {
    "id": "b86ddc8b-3501-4b17-9889-a3bad6fb585f",
    "image": "images/products/Citybus.png",
    "image1": "/images/New Project picz PDF/Citybus.pdf",
    "name": "AI Artwork - City bus",
    "rating": {
      "stars": 4.5,
      "count": 2286
    },
    "priceCents": 299
  },
  {
    "id": "19c6a64a-5463-4d45-9af8-e41140a4100c",
    "image": "images/products/Mountains.png",
    "image1": "/images/New Project picz PDF/Mountains.pdf",
    "name": "AI Artwork - Mountains",
    "rating": {
      "stars": 4,
      "count": 456
    },
    "priceCents": 299

  },
  {
    "id": "d2785924-743d-49b3-8f03-ec258e640503",
    "image": "images/products/Pinkfield.png",
    "image1": "/images/New Project picz PDF/Pinkfield.pdf",
    "name": "AI Artwork - Pinkfield",
    "rating": {
      "stars": 5,
      "count": 83
    },
    "priceCents": 299
  },
  {
    "id": "ee1f7c56-f977-40a4-9642-12ba5072e2b0",
    "image": "images/products/Beigeflowerfence.png",
    "image1": "/images/New Project picz PDF/Beigeflowerfence.pdf",
    "name": "AI Artwork - Beige flower fence",
    "rating": {
      "stars": 4.5,
      "count": 9017
    },
    "priceCents": 299

  },
  {
    "id": "1c079479-8586-494f-ab53-219325432536",
    "image": "images/products/Backlakeview.png",
    "image1": "/images/New Project picz PDF/Backlakeview.pdf",
    "name": "AI Artwork - Back lakeview",
    "rating": {
      "stars": 4,
      "count": 229
    },
    "priceCents": 299
  },
  {
    "id": "4df68c27-fd59-4a6a-bbd1-e754ddb6d53c",
    "image": "images/products/Boatdocks.png",
    "image1": "/images/New Project picz PDF/Boatdocks.pdf",
    "name": "AI Artwork - Boat docks",
    "rating": {
      "stars": 3.5,
      "count": 42
    },
    "priceCents": 299
  },
  {
    "id": "4e37dd03-3b23-4bc6-9ff8-44e112a92c64",
    "image": "images/products/BackyardLakeview.png",
    "image1": "/images/New Project picz PDF/Backyardlakeview.pdf",
    "name": "AI Artwork - Backyard Lakeview",
    "rating": {
      "stars": 4.5,
      "count": 511
    },
    "priceCents": 299
  },
  {
    "id": "a434b69f-1bc1-482d-9ce7-cd7f4a66ce8d",
    "image": "images/products/Barnwindmill.png",
    "image1": "/images/New Project picz PDF/Barnwindmill.pdf",
    "name": "Ai Artwork - Barn windmill",
    "rating": {
      "stars": 4.5,
      "count": 130
    },
    "priceCents": 299
  },
  {
    "id": "a45cfa0a-66d6-4dc7-9475-e2b01595f7d7",
    "image": "images/products/Thefarm.png",
    "image1": "/images/New Project picz PDF/Thefarm.pdf",
    "name": "AI Artwork - The farm",
    "rating": {
      "stars": 4.5,
      "count": 248
    },
    "priceCents": 299

  },
  {
    "id": "aaa65ef3-8d6f-4eb3-bc9b-a6ea49047d8f",
    "image": "images/products/Abstractsplash.png",
    "image1": "/images/New Project picz PDF/Abstractsplash.pdf",
    "name": "AI Artwork - Abstractsplash",
    "rating": {
      "stars": 4.5,
      "count": 1045
    },
    "priceCents": 299
  },
  {
    "id": "d339adf3-e004-4c20-a120-40e8874c66cb",
    "image": "images/products/Pinktree.png",

    "name": "AI Artwork - Pinktree",
    "rating": {
      "stars": 4.5,
      "count": 117
    },
    "priceCents": 299
  },
  {
    "id": "d37a651a-d501-483b-aae6-a9659b0757a0",
    "image": "images/products/Beigeflowerfence2.png",
    "image1": "/images/New Project picz PDF/Beigeflowerfence2.pdf",
    "name": "AI Artwork - Beige flower fence2",
    "rating": {
      "stars": 4,
      "count": 126
    },
    "priceCents": 299
  },
  {
    "id": "0d7f9afa-2efe-4fd9-b0fd-ba5663e0a524",
    "image": "images/products/Ballooninthejungle.png",
    "image1": "/images/New Project picz PDF/Balloonsinthejungle.pdf",
    "name": "AI Artwork - Balloons in the jungle",
    "rating": {
      "stars": 4.5,
      "count": 1211
    },
    "priceCents": 299
  },
  {
    "id": "02e3a47e-dd68-467e-9f71-8bf6f723fdae",
    "image": "images/products/Camels.png",
    "image1": "/images/New Project picz PDF/Camels.pdf",
    "name": "AI Artwork - Camels",
    "rating": {
      "stars": 4.5,
      "count": 363
    },
    "priceCents": 299

  },
  {
    "id": "8a53b080-6d40-4a65-ab26-b24ecf700bce",
    "image": "images/products/Polarbearstare.png",
    "image1": "/images/New Project picz PDF/Polarbearstare.pdf",
    "name": "AI Artwork - Polar bearstare",
    "rating": {
      "stars": 4.5,
      "count": 93
    },
    "priceCents": 299
  },
  {
    "id": "10ed8504-57db-433c-b0a3-fc71a35c88a1",
    "image": "images/products/Supermoon.png",
    "image1": "/images/New Project picz PDF/Thedawnmoon.pdf",
    "name": "AI Artwork - Supermoon",
    "rating": {
      "stars": 4,
      "count": 89
    },
    "priceCents": 299
  },
  {
    "id": "77a845b1-16ed-4eac-bdf9-5b591882113d",
    "image": "images/products/Redairplane.png",
    "image1": "/images/New Project picz PDF/RedAirplanes.pdf",
    "name": "AI Artwork - Red airplane",
    "rating": {
      "stars": 4,
      "count": 3
    },
    "priceCents": 299
  },
  {
    "id": "36c64692-677f-4f58-b5ec-0dc2cf109e27",
    "image": "images/products/Cityview.png",
    "image1": "/images/New Project picz PDF/Cityview.pdf",
    "name": "AI Artwork - City view",
    "rating": {
      "stars": 5,
      "count": 679
    },
    "priceCents": 299
  },
  {
    "id": "aaa65ef3-8d6f-4eb3-bc9b-a6ea49047d8f",
    "image": "images/products/Pinktree.png",
    "image1": "/images/New Project picz PDF/Pinktree.pdf",
    "name": "AI Artwork - Pinktree",
    "rating": {
      "stars": 4.5,
      "count": 1045
    },
    "priceCents": 299
  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a955",
    "image": "images/products/Airplanes.png",
    "image1": "/images/New Project picz PDF/Airplanes.pdf",
    "name": "AI Artwork - Warplanes",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299

  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a956",
    "image": "images/products/Balloons.png",
    "image1": "/images/New Project picz PDF/Balloons.pdf",
    "name": "AI Artwork - Balloons",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299

  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a957",
    "image": "images/products/Vflowers.png",
    "image1": "/images/New Project picz PDF/Vflowers.pdf",
    "name": "AI Artwork - Flowers",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299

  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a958",
    "image": "images/products/Abstractvibe.png",
    "image1": "/images/New Project picz PDF/Abstractvibe.pdf",
    "name": "AI Artwork - Abstract vibe",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299
  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a959",
    "image": "images/products/Tank.png",
    "image1": "/images/New Project picz PDF/Tank.pdf",
    "name": "AI Artwork - The Tank",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299
  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a960",
    "image": "images/products/Containership.png",
    "image1": "/images/New Project picz PDF/Containership.pdf",
    "name": "AI Artwork - Container Ship",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299
  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a961",
    "image": "images/products/Phonebooth.png",
    "image1": "/images/New Project picz PDF/Phonebooth.pdf",
    "name": "AI Artwork - Phone Booth",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299
  },
  {
    "id": "bc2847e9-5323-403f-b7cf-57fde044a962",
    "image": "images/products/Buffalo.png",
    "image1": "/images/New Project picz PDF/Phonebooth.pdf",
    "name": "AI Artwork - Buffalo",
    "rating": {
      "stars": 4.5,
      "count": 3157
    },
    "priceCents": 299
  },
];