import * as React from "react"
import MainPage from "../pages/main/MainPage"
import MyPage from "../pages/my/MyPage"
import BuyChickenPage from "../pages/buychicken/BuyChickenPage"
import GamePage from "../pages/game/GamePage"
import MarketPage from "../pages/market/MarketPage"
import App from "./App"
import GameDetailsPage from "../pages/game/GameDetailsPage"

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "my", element: <MyPage /> },
      { path: "main", element: <MainPage /> },
      { path: "buychicken/*", element: <BuyChickenPage /> },
      { path: "game/*", 
        children: [
          { index: true, element: <GamePage /> },
          { path: ":gameId", element: <GameDetailsPage /> }
        ],
      },
      { path: "market", element: <MarketPage /> },
    ],
  },
]

export default routes