import React from "react"
import { Link, useNavigate, useMatch } from "react-router-dom"
import { Container, Tabs, Flex, Text, Button, createStyles, Group, Header, Space } from "@mantine/core"
import "@mysten/dapp-kit/dist/index.css"
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import RoundButton from "../components/RoundButton"
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet"

function CustomHeader(props) {
  const gameMatch = useMatch("/game/*")
  const marketMatch = useMatch("/market/*")
  const buychickenMatch = useMatch("/buychicken/*")
  const myMatch = useMatch("/my/*")
  const homeMatch = !(gameMatch || marketMatch || buychickenMatch || myMatch)
  const { mutate: disconnect } = useDisconnectWallet()
  const account = useCurrentAccount()

  const { height } = props

  const value = homeMatch ? "home" : gameMatch ? "game" : marketMatch ? "market" : myMatch ? "my" : "buychicken"
  const navigate = useNavigate()

  const faucet = async () => {
    await requestSuiFromFaucetV0({
      host: getFaucetHost("testnet"),
      recipient: account!.address,
    })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    window.location.reload()
  }

  const parseAdd = () => {
    const address = account!.address
    if (address && address.length > 8) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    return address
  }

  return (
    <Header
      height={height}
      style={{
        borderBottom: "none",
        background: "transparent",
      }}
    >
      <Flex justify="space-between" w="100%">
        <Tabs
          size="lg"
          defaultValue="home"
          w="100%"
          value={value}
          onTabChange={(page) => navigate(`/${page}`)}
          styles={(theme) => ({
            tab: {
              padding: `0 12px`,
              lineHeight: height + "px",
              fontWeight: "bold",
              color: theme.colors["white"][0],
              border: "none",
              "&[data-active]": {
                color: theme.colors["custom-orange"][1],
              },
              "&:hover": {
                background: "none",
              },
            },
            tabsList: {
              borderBottom: "none",
            },
            borderBottom: "none",
          })}
        >
          <Tabs.List position="left" grow={true}>
            <Link to="/">
              <Tabs.Tab value="home" c="">
                HOME
              </Tabs.Tab>
            </Link>
            <Link to="/buychicken">
              <Tabs.Tab value="buychicken">BUY CHICKEN</Tabs.Tab>
            </Link>
            <Link to="/game">
              <Tabs.Tab value="game">GAME</Tabs.Tab>
            </Link>
            <Link to="/market">
              <Tabs.Tab value="market">MARKET</Tabs.Tab>
            </Link>
            <Space
              style={{
                flex: "1 0 auto",
              }}
            ></Space>
            <Link to="/my">
              <Tabs.Tab value="my" position="right" align="right">
                MYPAGE
              </Tabs.Tab>
            </Link>
          </Tabs.List>
        </Tabs>
        <Container
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!account ? (
            <ConnectModal
              trigger={<RoundButton to="/" text="CONNECT WALLET" size="lg" variant="outline" textColor="white.0" />}
            />
          ) : (
            <>
              <RoundButton
                text='faucet'
                size="lg"
                variant="outline"
                textColor="white.0"
                onClick={async() => await faucet()}
              />
              <RoundButton
                to="/"
                text={parseAdd()}
                size="lg"
                variant="outline"
                textColor="white.0"
                onClick={() => disconnect()}
              />
            </>
          )}
        </Container>
        {/* </Link> */}
      </Flex>
    </Header>
  )
}

export default CustomHeader
