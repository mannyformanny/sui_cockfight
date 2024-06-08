import { Flex, Title, Text, Tabs, Group, Stack, Center, Card, Space, Popover, Checkbox } from "@mantine/core"
import EggCard from "../../components/EggCard"
import * as React from "react"
import { useStyles } from "../../styles/style"
import { useNavigate, Link } from "react-router-dom"
import RoundButton from "../../components/RoundButton"
import FilterCheckbox from "../../components/FilterCheckbox"
import GameCard from "../../components/GameCard"
import HistoryComponent from "../../components/HistoryComponent"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet"
import axios from 'axios';
import { API_URL, CockieType, DUMMY_EGG_PRICE, DUMMY_STABLE_COCKIE_PRICE, DUMMY_VOLATILE_COCKIE_PRICE } from "../../lib/consts"
import { User } from "../../lib/types"

import raceThum from "../../images/game/race_thum.png"
import lotteryThum from "../../images/game/lottery_thum.png"

const assetSectionHeight = 350

const MyPage = () => {
  const { classes } = useStyles()
  const [eggRewardDetailDisplayed, setEggRewardDetailDisplayed] = React.useState(false)
  const [myBalance, setMyBalance] = React.useState(0)

  const [egg, setEgg] = React.useState(0)
  const [stableChicken, setStableChicken] = React.useState(0)
  const [volatileChicken, setVolatileChicken] = React.useState(0)
  
  const [totalAssetValue, setTotalAssetValue] = React.useState(0)
  const [eggValue, setEggValue] = React.useState(0)
  const [stableChickenValue, setStableChickenValue] = React.useState(0)
  const [volatileChickenValue, setVolatileChickenValue] = React.useState(0)

  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  
  const getBalance = async () => {
    const balance = await suiClient.getBalance({
      owner: account!.address,
    })
    setMyBalance(parseInt(balance.totalBalance))
  }

  const fetchData = async () => {
    try {
      if (account) {
        const accountRes = await axios.get(
          `${API_URL}/user?address=${account.address}`,
        );
        const user: User = accountRes.data;
        console.log(user);
        let stable = 0;
        let volatile = 0;
        for (const cockie of user.cockies) {
          if (cockie.type === CockieType.STABLE) {
            stable += 1;
          } else if (cockie.type === CockieType.VOLATILE) {
            volatile += 1;
          }
        }
        setEgg(user.egg);
        setStableChicken(stable);
        setVolatileChicken(volatile);
        
        const eggValue = user.egg * DUMMY_EGG_PRICE;
        const stableChickenValue = stable * DUMMY_STABLE_COCKIE_PRICE ;
        const volatileChickenValue = volatile * DUMMY_VOLATILE_COCKIE_PRICE * (1 + Math.random() * 0.1 - 0.05);
        const totalAssetValue = eggValue + stableChickenValue + volatileChickenValue;
        setEggValue(eggValue);
        setStableChickenValue(stableChickenValue);
        setVolatileChickenValue(volatileChickenValue);
        setTotalAssetValue(totalAssetValue);
      }
    } catch (error) {
      console.error('Failed to fetch egg balance:', error);
      // Handle error appropriately
    }
  };

  React.useEffect(() => {
    getBalance()
    fetchData()
  }, [account])


  function renderEggReward() {
    if (!eggRewardDetailDisplayed) {
      return (
        <Stack
          p={24}
          bg="dark-grey.0"
          h={assetSectionHeight}
          align="start"
          spacing={8}
          style={{
            display: "flex",
            borderRadius: "24px",
            flex: "1 1 0",
          }}
        >
          <Text c="custom-orange.1" weight={600}>
            TOTAL<br></br>EGG REWARDS
          </Text>
          <Title c="white.0" order={3}>
            {egg}
          </Title>
          <Text c="grey.0">$ {eggValue.toFixed(2)}</Text>
          <Space
            style={{
              flex: "1 0 0",
            }}
          ></Space>
          <RoundButton
            fullWidth={true}
            size="lg"
            variant="outline"
            text="VIEW DETAILS"
            textColor={"white.0"}
            onClick={() => {
              setEggRewardDetailDisplayed(true)
            }}
          ></RoundButton>
        </Stack>
      )
    } else {
      return (
        <Stack
          p={24}
          bg="light-orange.0"
          h={assetSectionHeight}
          align="start"
          spacing={8}
          style={{
            display: "flex",
            borderRadius: "24px",
            flex: "1 1 0",
          }}
        >
          <Stack spacing={8}>
            <Text c="custom-orange.1" weight={600}>
              STACKING REWARDS
            </Text>
            <Title c="black.0" order={3}>
              $ LLLL.LLL
            </Title>
            <Text c="black.0">$ NNN.NNNN</Text>
          </Stack>
          <hr
            color="#aaaaaa"
            style={{
              width: "100%",
              height: "0.5px",
              margin: 0,
            }}
          ></hr>
          <Stack spacing={8}>
            <Text c="custom-orange.1" weight={600}>
              WINNING REWARDS
            </Text>
            <Title c="black.0" order={3}>
              $ LLLL.LLL
            </Title>
            <Text c="black.0">$ NNN.NNNN</Text>
          </Stack>
          <Space
            style={{
              flex: "1 0 0",
            }}
          ></Space>
          <RoundButton
            fullWidth={true}
            size="lg"
            variant="outline"
            text="BACK TO TOTAL"
            textColor={"black.0"}
            onClick={() => {
              setEggRewardDetailDisplayed(false)
            }}
          ></RoundButton>
        </Stack>
      )
    }
  }
  return (
    <Stack className={classes.frameFlex} spacing={80}>
      <Flex direction="row" gap={20} w={"100%"}>
        <Center
          p={24}
          h={assetSectionHeight}
          bg="custom-orange.1"
          style={{
            flex: "2 1 0",
            flexDirection: "column",
            borderRadius: "24px",
            alignItems: "start",
          }}
        >
          {/* {account && (
            <div>
              <button onClick={faucet}>Faucet</button>
            </div>
          )} */}
          <Title c="black.0" order={3} mb={10}>
            YOUR TOTAL ASSET
          </Title>
          <Title c="black.0" order={2}>
            $ {totalAssetValue.toFixed(2)}
          </Title>
        </Center>
        {renderEggReward()}
        <Stack
          h={assetSectionHeight}
          style={{
            flex: "1 1 0",
          }}
        >
          <Stack
            p={24}
            bg="dark-grey.0"
            align="start"
            spacing={8}
            style={{
              display: "flex",
              borderRadius: "24px",
              flex: "1 1 0",
            }}
          >
            <Text c="custom-orange.1" weight={600}>
              VOLATILE CHICKEN
            </Text>
            <Title c="white.0" order={3}>
             {volatileChicken}
            </Title>
            <Text c="grey.0">$ {volatileChickenValue.toFixed(2)} </Text>
          </Stack>
          <Stack
            p={24}
            bg="dark-grey.0"
            align="start"
            spacing={8}
            style={{
              display: "flex",
              borderRadius: "24px",
              flex: "1 1 0",
            }}
          >
            <Text c="custom-orange.1" weight={600}>
              STABLE CHICKEN
            </Text>
            <Title c="white.0" order={3}>
              {stableChicken}
            </Title>
            <Text c="grey.0">$ {stableChickenValue.toFixed(2)}</Text>
          </Stack>
        </Stack>
      </Flex>
      <Flex direction="row" justify="space-between" w="100%">
        <Tabs
          size="xl"
          defaultValue="menu1"
          w="100%"
          styles={(theme) => ({
            tab: {
              fontSize: "24px",
              padding: `0 12px`,
              lineHeight: 60 + "px",
              fontWeight: "bold",
              color: theme.colors["grey"][0],
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
          <Tabs.List>
            <Tabs.Tab value="menu1" c="">
              MENU1
            </Tabs.Tab>
            <Tabs.Tab value="menu2">MENU2</Tabs.Tab>
            <Tabs.Tab value="menu3">MENU3</Tabs.Tab>
            <Tabs.Tab value="menu4">MENU4</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Space
          style={{
            flex: "1 0 auto",
          }}
        ></Space>
        <Popover>
          <Popover.Target>
            <Text c="white.0" lh="60px" weight={600} size={20}>
              FILTER
            </Text>
          </Popover.Target>
          <Popover.Dropdown
            p={24}
            bg="custom-orange.1"
            style={{
              border: "none",
              borderRadius: "20px",
            }}
          >
            <Stack w="220px">
              <FilterCheckbox label="SEE ALL"></FilterCheckbox>
              <FilterCheckbox label="GAME 1"></FilterCheckbox>
              <FilterCheckbox label="GAME 2"></FilterCheckbox>
              <FilterCheckbox label="GAME 3"></FilterCheckbox>
              <FilterCheckbox label="GAME 4"></FilterCheckbox>
              <RoundButton size="lg" variant="outline" textColor="black.0" bgColor="" text="VIEW MORE"></RoundButton>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Flex>
      <Flex direction="row" wrap="wrap" gap={16} justify="space-around">
        <GameCard
          time="1H 25M 34S"
          title="RACE"
          text={
            <span>
              Bet amount: 100 eggs<br></br> Winning amount: 2500 eggs
            </span>
          }
          src={raceThum}
          gameKey="1"
        ></GameCard>
        <GameCard
          time="1H 25M 34S"
          title="LOTTERY"
          text={
            <span>
              Bet amount: 100 eggs<br></br> Winning amount: 2500 eggs
            </span>
          }
          src={lotteryThum}
          gameKey="2"
        ></GameCard>
        {/* <GameCard
          time="1H 25M 34S"
          title="LOTERY"
          text={
            <span>
              Bet amount: 100 eggs<br></br> Winning amount: 2500 eggs
            </span>
          }
          src="https://previews.123rf.com/images/sudakasi/sudakasi1405/sudakasi140500174/28673467-%EC%95%84%EB%A6%84%EB%8B%A4%EC%9A%B4-%EC%9E%90%EC%97%B0-%EB%B0%B0%EA%B2%BD.jpg"
          gameKey="3"
        ></GameCard>
        <GameCard
          time="1H 25M 34S"
          title="PRICE PREDICTION"
          text={
            <span>
              Bet amount: 100 eggs<br></br> Winning amount: 2500 eggs
            </span>
          }
          src="https://previews.123rf.com/images/sudakasi/sudakasi1405/sudakasi140500174/28673467-%EC%95%84%EB%A6%84%EB%8B%A4%EC%9A%B4-%EC%9E%90%EC%97%B0-%EB%B0%B0%EA%B2%BD.jpg"
          gameKey="4"
        ></GameCard>
        <GameCard
          time="1H 25M 34S"
          title="LOTERY"
          text={
            <span>
              Bet amount: 100 eggs<br></br> Winning amount: 2500 eggs
            </span>
          }
          src="https://previews.123rf.com/images/sudakasi/sudakasi1405/sudakasi140500174/28673467-%EC%95%84%EB%A6%84%EB%8B%A4%EC%9A%B4-%EC%9E%90%EC%97%B0-%EB%B0%B0%EA%B2%BD.jpg"
          gameKey="5"
        ></GameCard>
        <GameCard
          time="1H 25M 34S"
          title="PRICE PREDICTION"
          text={
            <span>
              Bet amount: 100 eggs<br></br> Winning amount: 2500 eggs
            </span>
          }
          src="https://previews.123rf.com/images/sudakasi/sudakasi1405/sudakasi140500174/28673467-%EC%95%84%EB%A6%84%EB%8B%A4%EC%9A%B4-%EC%9E%90%EC%97%B0-%EB%B0%B0%EA%B2%BD.jpg"
          gameKey="6"
        ></GameCard> */}
      </Flex>
      <Stack w="100%" p="16px" spacing={0}>
        <Text c="custom-orange.1" mb={20}>
          HISTORY
        </Text>
        <HistoryComponent
          title={"PRICE PREDICTION"}
          dayDiff="2"
          betAmount="400"
          isWin={true}
          resultAmount="1600"
        ></HistoryComponent>
        <HistoryComponent
          title={"PRICE PREDICTION"}
          dayDiff="2"
          betAmount="100"
          isWin={false}
          resultAmount="100"
        ></HistoryComponent>
        <HistoryComponent
          title={"PRICE PREDICTION"}
          dayDiff="2"
          betAmount="500"
          isWin={true}
          resultAmount="3000"
        ></HistoryComponent>
        <HistoryComponent
          title={"PRICE PREDICTION"}
          dayDiff="2"
          betAmount="700"
          isWin={true}
          resultAmount="3000"
        ></HistoryComponent>
      </Stack>
    </Stack>
  )
}

export default MyPage
